# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# import asyncio
# from src.main import query_pdf
# from src.db.models.query import QueryRequest,ConverstaionReq
# from bson import ObjectId



# test_user = {"id":"67f3134ef02ffed062faba79"}


# def answer_question(pdf_id: str, question: str) -> str:
#     req = QueryRequest(query=question, pdf_id=pdf_id)
    
#     async def run_query():
#         try:
#             result = await query_pdf(req, current_user=test_user)
#             return result.get("response", "No response")
#         except Exception as e:
#             print(f"Error: {e}")
#             return "Error"

#     return asyncio.run(run_query())