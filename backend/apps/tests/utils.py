import openpyxl
from .models import Question, Choice

def parse_test_excel(test_obj, file_path):
    """
    Parses an Excel file and creates Question and Choice objects for a given Test.
    Format assumed:
    A: Question Text
    B: Choice 1
    C: Choice 2
    D: Choice 3
    E: Choice 4
    F: Correct Choice Index (1-4) or Correct Choice Text
    """
    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active
    
    questions_created = 0
    
    # Skip header row if exists (assuming first row might be header)
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row[0]: # Skip empty rows
            continue
            
        question_text = str(row[0])
        choices_texts = [str(row[i]) for i in range(1, 5) if row[i]]
        correct_indicator = row[5]
        
        question = Question.objects.create(test=test_obj, text=question_text)
        
        for i, choice_text in enumerate(choices_texts):
            is_correct = False
            # Check if correct_indicator is index (1-based) or text
            if isinstance(correct_indicator, int):
                if i + 1 == correct_indicator:
                    is_correct = True
            elif str(correct_indicator).strip().lower() == choice_text.strip().lower():
                is_correct = True
            
            Choice.objects.create(question=question, text=choice_text, is_correct=is_correct)
        
        questions_created += 1
    
    return questions_created
