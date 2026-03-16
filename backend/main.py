from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import pandas as pd
import json
import os
from dotenv import load_dotenv
import io

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

DEFAULT_CSV_PATH = "data.csv"
default_df = pd.read_csv(DEFAULT_CSV_PATH)

uploaded_dataframes = {}
conversation_history = {}

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"
    use_uploaded: Optional[bool] = False

def get_schema_summary(df: pd.DataFrame) -> str:
    summary = f"Total rows: {len(df)}\n"
    summary += f"Columns: {', '.join(df.columns.tolist())}\n\n"
    for col in df.columns:
        unique_vals = df[col].unique()
        if len(unique_vals) <= 15:
            summary += f"- {col}: {list(unique_vals)}\n"
        else:
            summary += f"- {col}: numeric/text column, range [{df[col].min()} to {df[col].max()}]\n"
    return summary

def build_system_prompt(df: pd.DataFrame, conversation_ctx: str = "") -> str:
    schema = get_schema_summary(df)
    return f"""
You are an expert Business Intelligence AI assistant. Your job is to analyze business data and return dashboard configurations.

DATASET SCHEMA:
{schema}

SAMPLE DATA (first 3 rows):
{df.head(3).to_string()}

{f"CONVERSATION HISTORY (for follow-up context):{conversation_ctx}" if conversation_ctx else ""}

YOUR TASK:
Given a natural language business question, you must return a JSON response with chart configurations.

RULES:
1. ALWAYS return valid JSON only. No extra text, no markdown, no explanation outside JSON.

2. CHART SELECTION RULES (strictly follow these data visualization best practices):
   - Use "line" ONLY for: trends over time, monthly data, yearly data, quarterly trends, time series analysis
   - Use "bar" ONLY for: comparing categories, ranking items, regional comparisons, product comparisons, segment analysis
   - Use "pie" ONLY for: percentage breakdowns, market share, parts of a whole (ONLY when 6 or fewer categories)
   - Use "area" ONLY for: cumulative trends, growth over time, stacked comparisons
   - NEVER use pie chart if there are more than 6 categories
   - NEVER use line chart if data is not time-based
   - NEVER use pie chart for simple comparisons between unrelated categories
   - When question mentions "trend", "over time", "monthly", "quarterly", "yearly" → ALWAYS use line or area
   - When question mentions "compare", "breakdown", "by region", "by product" → ALWAYS use bar
   - When question mentions "percentage", "share", "proportion", "distribution" → ALWAYS use pie

3. ALWAYS return minimum 2 charts, maximum 4 charts. Even for simple questions, show the data in 2 different ways. For example if asked about revenue by region, show a bar chart AND a pie chart of the same data.

4. Use ONLY columns that exist in the dataset schema above.

5. If a question cannot be answered with available data, return an error JSON.

6. For follow-up questions, use the conversation history to understand context and apply filters accordingly.

7. Always aggregate data properly (sum revenue, count orders, average price etc.)

8. Never make up data or hallucinate numbers. Only use values that exist in the dataset.

9. For filters, use exact values that exist in the dataset columns listed above.

RESPONSE FORMAT (return exactly this JSON structure):
{{
  "success": true,
  "question_understood": "brief restatement of what was asked",
  "charts": [
    {{
      "id": "chart_1",
      "title": "Chart Title Here",
      "subtitle": "Brief description",
      "chart_type": "bar",
      "x_axis": "column_name_for_x",
      "y_axis": "column_name_for_y",
      "aggregation": "sum",
      "filters": {{}},
      "color": "#3b82f6",
      "data": [
        {{"name": "Category1", "value": 12345}},
        {{"name": "Category2", "value": 67890}}
      ]
    }}
  ],
  "insight": "One key insight about the data in plain English"
}}

IF QUESTION CANNOT BE ANSWERED:
{{
  "success": false,
  "error": "Explanation of why this cannot be answered with available data",
  "suggestion": "What kind of question CAN be answered with this dataset"
}}

CHART COLOR GUIDE (use these colors):
- First chart: "#3b82f6" (blue)
- Second chart: "#8b5cf6" (purple)
- Third chart: "#06b6d4" (cyan)
- Fourth chart: "#10b981" (green)

Now answer this question using the dataset:
"""

def execute_chart_query(chart_config: dict, df: pd.DataFrame) -> list:
    try:
        x_axis = chart_config.get("x_axis")
        y_axis = chart_config.get("y_axis")
        aggregation = chart_config.get("aggregation", "sum")
        filters = chart_config.get("filters", {})

        filtered_df = df.copy()
        for col, val in filters.items():
            if col in filtered_df.columns:
                if isinstance(val, list):
                    filtered_df = filtered_df[filtered_df[col].isin(val)]
                else:
                    filtered_df = filtered_df[filtered_df[col] == val]

        if x_axis in filtered_df.columns and y_axis in filtered_df.columns:
            if aggregation == "sum":
                result = filtered_df.groupby(x_axis)[y_axis].sum().reset_index()
            elif aggregation == "mean":
                result = filtered_df.groupby(x_axis)[y_axis].mean().reset_index()
            elif aggregation == "count":
                result = filtered_df.groupby(x_axis)[y_axis].count().reset_index()
            elif aggregation == "max":
                result = filtered_df.groupby(x_axis)[y_axis].max().reset_index()
            elif aggregation == "min":
                result = filtered_df.groupby(x_axis)[y_axis].min().reset_index()
            else:
                result = filtered_df.groupby(x_axis)[y_axis].sum().reset_index()

            month_order = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"]
            if x_axis == "month":
                result[x_axis] = pd.Categorical(result[x_axis], categories=month_order, ordered=True)
                result = result.sort_values(x_axis)

            data = []
            for _, row in result.iterrows():
                data.append({
                    "name": str(row[x_axis]),
                    "value": round(float(row[y_axis]), 2),
                    "label": str(row[x_axis])
                })
            return data

        return chart_config.get("data", [])

    except Exception as e:
        print(f"Error executing chart query: {e}")
        return chart_config.get("data", [])

def calculate_stats(df: pd.DataFrame) -> dict:
    try:
        revenue_col = None
        for col in ['revenue', 'Revenue', 'sales', 'Sales', 'amount', 'Amount', 'total', 'Total']:
            if col in df.columns:
                revenue_col = col
                break
        if not revenue_col:
            numeric_cols = df.select_dtypes(include='number').columns
            if len(numeric_cols) > 0:
                revenue_col = numeric_cols[0]

        region_col = None
        for col in ['region', 'Region', 'country', 'Country', 'city', 'City', 'location', 'Location']:
            if col in df.columns:
                region_col = col
                break

        quarter_col = None
        for col in ['quarter', 'Quarter', 'q', 'Q']:
            if col in df.columns:
                quarter_col = col
                break

        def format_number(n):
            if n >= 1_000_000_000:
                return f"${n/1_000_000_000:.1f}B"
            elif n >= 1_000_000:
                return f"${n/1_000_000:.1f}M"
            elif n >= 1_000:
                return f"${n/1_000:.0f}K"
            return f"${n}"

        total_revenue = int(df[revenue_col].sum()) if revenue_col else 0
        total_orders = len(df)
        avg_order_value = int(df[revenue_col].mean()) if revenue_col else 0

        top_region = "N/A"
        if region_col and revenue_col:
            top_region = df.groupby(region_col)[revenue_col].sum().idxmax()

        ytd_growth = "+0%"
        if quarter_col and revenue_col:
            try:
                q1 = int(df[df[quarter_col] == 'Q1'][revenue_col].sum())
                q4 = int(df[df[quarter_col] == 'Q4'][revenue_col].sum())
                if q1 > 0:
                    growth = round(((q4 - q1) / q1) * 100, 1)
                    ytd_growth = f"+{growth}%" if growth > 0 else f"{growth}%"
            except:
                pass

        return {
            "success": True,
            "total_revenue": format_number(total_revenue),
            "total_orders": total_orders,
            "avg_order_value": format_number(avg_order_value),
            "top_region": top_region,
            "ytd_growth": ytd_growth
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/stats")
async def get_stats(use_uploaded: bool = False, session_id: str = "default"):
    try:
        if use_uploaded and session_id in uploaded_dataframes:
            df = uploaded_dataframes[session_id]
        else:
            df = default_df
        return calculate_stats(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_dashboard(request: QueryRequest):
    try:
        session_id = request.session_id or "default"

        if request.use_uploaded and session_id in uploaded_dataframes:
            df = uploaded_dataframes[session_id]
        else:
            df = default_df

        history = conversation_history.get(session_id, [])
        conversation_ctx = ""
        if history:
            recent = history[-3:]
            conversation_ctx = "\n".join([f"User asked: {h['question']}" for h in recent])

        system_prompt = build_system_prompt(df, conversation_ctx)
        full_prompt = system_prompt + request.question

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a Business Intelligence AI. Always respond with valid JSON only. No extra text. Follow chart selection rules strictly."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.1,
            max_tokens=2000,
        )

        raw_text = response.choices[0].message.content.strip()

        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        result = json.loads(raw_text)

        if result.get("success") and "charts" in result:
            for i, chart in enumerate(result["charts"]):
                real_data = execute_chart_query(chart, df)
                if real_data:
                    result["charts"][i]["data"] = real_data

        if session_id not in conversation_history:
            conversation_history[session_id] = []
        conversation_history[session_id].append({
            "question": request.question,
            "charts_count": len(result.get("charts", []))
        })

        return result

    except json.JSONDecodeError:
        return {
            "success": False,
            "error": "AI response could not be parsed. Please try rephrasing your question.",
            "suggestion": "Try asking something like: Show me monthly revenue for 2024"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...), session_id: str = "default"):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")

        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        uploaded_dataframes[session_id] = df
        conversation_history[session_id] = []

        stats = calculate_stats(df)

        return {
            "success": True,
            "message": "CSV uploaded successfully!",
            "rows": len(df),
            "columns": df.columns.tolist(),
            "preview": df.head(3).to_dict(orient="records"),
            "stats": stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/clear-history/{session_id}")
async def clear_history(session_id: str):
    if session_id in conversation_history:
        conversation_history[session_id] = []
    return {"success": True, "message": "Conversation history cleared"}

@app.get("/")
async def root():
    return {"status": "Backend is running!", "message": "QueryDash API ready"}

@app.get("/health")
async def health():
    return {"status": "ok"} 