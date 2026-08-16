import os

knowledge_dir = r"C:\Users\user\Desktop\E-Pos\Pos-system-Knowledge"

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

# 1. QA Tests
qa_file = os.path.join(knowledge_dir, "10_TESTING_QA", "Test_Case", "10_Product_Core", "Bundle_Add_Product_Test_Cases.md")
replace_in_file(qa_file, [
    ("5. Step 3 → Step 4", "5. legacy BUNDLE Step 3 draft normalizes to Step 4\n5b. Step 4 Back → Step 2\n5c. malformed duplicate API payload returns duplicate_component")
])

# 2. 8 Step Contract Navigation
contract_file = os.path.join(knowledge_dir, "04_MODULE_KNOWLEDGE", "10_Product_Core", "05_Tenant_Admin_Add_Product_8_Step_Contract.md")
nav_replace_old = "| **Navigation** | Save & Continue from Step 2 | Step advances to 3. `current_setup_step = 3`. |"
nav_replace_new = "| **Navigation** | Save & Continue from Step 2 | Step advances based on structure (BUNDLE → Step 4; SIMPLE/VARIANT → Step 3 if applicable, else Step 4). |"
val_replace_old = "| **Save & Continue (Step 2)** | Structure valid enum; Tracking matrix valid according to truth table; `advanceStep = true` $\\rightarrow$ `current_setup_step = 3` | Advances to Step 3 upon HTTP 200 OK |"
val_replace_new = "| **Save & Continue (Step 2)** | Structure valid enum; Tracking matrix valid according to truth table; `advanceStep = true` | Advances to next applicable Step upon HTTP 200 OK |"
replace_in_file(contract_file, [
    (nav_replace_old, nav_replace_new),
    (val_replace_old, val_replace_new),
    ("Save Draft with 0 components succeeds", "First Step 4 Save Draft with 0 components creates one empty combo_definitions row, zero combo_components rows.\n50b. First non-empty Save creates/updates combo_definitions and inserts combo_components.\n50c. Repeated Save updates combo_components.\n50d. All components removed physically deletes all combo_components rows.")
])
# Also update the qa file with the zero component exact statement
replace_in_file(qa_file, [
    ("50. Save Draft with 0 components succeeds", "50. First Step 4 Save Draft with 0 components creates one empty combo_definitions row, zero combo_components rows.\n50b. First non-empty Save creates/updates combo_definitions and inserts combo_components.\n50c. Repeated Save updates combo_components.\n50d. All components removed physically deletes all combo_components rows.")
])

# 3. Functional Rules Lifecycle
func_file = os.path.join(knowledge_dir, "04_MODULE_KNOWLEDGE", "10_Product_Core", "02_Functional_Rules.md")
func_replace_old = "- **Confirm**: Removes/retires Bundle configuration (`combo_definitions`, `combo_components`), clears component mappings, resets Step 4 completion, clears derived state, and applies new structure rules."
func_replace_new = "- **Confirm**: Physically deletes `combo_definitions` and `combo_components` rows (for BUNDLE → SIMPLE and BUNDLE → VARIANT), clears component mappings, resets Step 4 completion, clears derived state, and applies new structure rules."
replace_in_file(func_file, [
    (func_replace_old, func_replace_new)
])

# 4. Readiness Audit
audit_file = os.path.join(knowledge_dir, "15_IMPLEMENTATION_TRACKING", "99_AUDITS", "2026-08-14_Tenant_Admin_Bundle_Kit_Step4_Second_Brain_Readiness_Audit.md")
replace_in_file(audit_file, [
    ("combo_definitions and combo_components are created on first successful Save Draft.", "First Step 4 SAVE_DRAFT with 0 components creates one empty combo_definitions row, zero combo_components rows.\n- First non-empty Save creates/updates combo_definitions and inserts combo_components.\n- Repeated Save updates combo_components.\n- All components removed keeps combo_definitions row, physically deletes all combo_components rows.")
])

print("Replacements done.")
