import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
print("🚀 Starting evaluation...")
import pandas as pd
from sklearn.metrics import f1_score
import nltk
from nltk.tokenize import word_tokenize
from src.testing.evaluation_interface  import answer_question  # <-- Calls your FastAPI logic

nltk.download('punkt')

def normalize_answer(text):
    return " ".join(word_tokenize(text.lower().strip()))

def compute_f1(pred, truth):
    pred_tokens = normalize_answer(pred).split()
    truth_tokens = normalize_answer(truth).split()
    common = set(pred_tokens) & set(truth_tokens)
    if not common:
        return 0.0
    precision = len(common) / len(pred_tokens) if pred_tokens else 0
    recall = len(common) / len(truth_tokens) if truth_tokens else 0
    if precision + recall == 0:
        return 0.0
    return 2 * (precision * recall) / (precision + recall)

def evaluate(df):
    f1s = []
    exact_matches = []

    for _, row in df.iterrows():
        question = row['question']
        gold_answer = row['answer']
        pdf_id = row['pdf_id']

        system_answer = answer_question(pdf_id, question)

        f1 = compute_f1(system_answer, gold_answer)
        exact = normalize_answer(system_answer) == normalize_answer(gold_answer)

        f1s.append(f1)
        exact_matches.append(exact)

        print(f"Q: {question}")
        print(f"Expected: {gold_answer}")
        print(f"Got     : {system_answer}")
        print(f"F1 Score: {f1:.2f}, Exact Match: {exact}")
        print("-" * 50)

    print(f"\nAverage F1 Score: {sum(f1s)/len(f1s):.2f}")
    print(f"Exact Match Rate: {sum(exact_matches)/len(exact_matches)*100:.2f}%")

if __name__ == "__main__":
    df = pd.read_csv("qa_test_set.csv")  # Your test CSV
    evaluate(df)
