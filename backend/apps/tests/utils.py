import openpyxl
from .models import Question, Choice

def parse_test_excel(test_obj, file_path, pool=None):
    """
    Parses an Excel file and creates Question and Choice objects for a given Test.
    Format assumed:
    A: Question Text
    B: Correct Answer (Choice 1)
    C: Choice 2
    D: Choice 3
    E: Choice 4
    """
    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active
    
    questions_created = 0
    
    # Skip header row if exists
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row[0]: # Skip empty rows
            continue
            
        question_text = str(row[0])
        # Column B is correct answer, C, D, E are other variants, F is optional explanation
        choices_data = []
        if row[1]: choices_data.append({'text': str(row[1]), 'is_correct': True})
        if row[2]: choices_data.append({'text': str(row[2]), 'is_correct': False})
        if row[3]: choices_data.append({'text': str(row[3]), 'is_correct': False})
        if row[4]: choices_data.append({'text': str(row[4]), 'is_correct': False})
        
        explanation = str(row[5]) if len(row) > 5 and row[5] else None
        
        if not choices_data:
            continue

        question = Question.objects.create(
            test=test_obj, 
            pool=pool, 
            text=question_text,
            explanation=explanation
        )
        
        for choice in choices_data:
            Choice.objects.create(
                question=question, 
                text=choice['text'], 
                is_correct=choice['is_correct']
            )
        
        questions_created += 1
    
    return questions_created
