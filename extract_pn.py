import os
import pandas as pd
from pypdf import PdfReader

dir_path = r'c:\Users\ByArc\Desktop\PN'
output_txt = r'c:\Users\ByArc\Desktop\krevo-saas\extracted_docs.txt'

with open(output_txt, 'w', encoding='utf-8') as out:
    for file in os.listdir(dir_path):
        filepath = os.path.join(dir_path, file)
        out.write(f'\n\n--- FILE: {file} ---\n\n')
        
        if file.endswith('.pdf'):
            try:
                reader = PdfReader(filepath)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        out.write(text + '\n')
            except Exception as e:
                out.write(f'Error reading PDF: {str(e)}\n')
                
        elif file.endswith('.xlsx'):
            try:
                xls = pd.ExcelFile(filepath)
                for sheet in xls.sheet_names:
                    out.write(f'\nSheet: {sheet}\n')
                    df = pd.read_excel(xls, sheet_name=sheet, nrows=50) # Solo las primeras 50 filas
                    out.write(df.to_string(index=False) + '\n')
            except Exception as e:
                out.write(f'Error reading Excel: {str(e)}\n')
