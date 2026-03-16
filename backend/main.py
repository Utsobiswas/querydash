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
    allow_origins=["http://localhost:3000"],
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
2. Choose the BEST chart type:
   - Use "line" for trends over time (monthly, quarterly, yearly)
   - Use "bar" for comparisons between categories (regions, products, segments)
   - Use "pie" for parts of a whole (market share, category distribution)
   - Use "area" for cumulative trends
3. ALWAYS return minimum 2 charts, maximum 4 charts. Even for simple questions, show the data in 2 different ways.
4. Use ONLY columns that exist in the dataset schema above.
5. If a question cannot be answered with available data, return an error JSON.
6. For follow-up questions, use the conversation history to understand context.
7. Always aggregate data properly (sum revenue, count orders, average price etc.)
8. Never make up data or hallucinate numbers.

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
  "suggestion": "What kind of question can be answered"
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
                    "content": "You are a Business Intelligence AI. Always respond with valid JSON only. No extra text."
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

        return {
            "success": True,
            "message": "CSV uploaded successfully!",
            "rows": len(df),
            "columns": df.columns.tolist(),
            "preview": df.head(3).to_dict(orient="records")
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