// Shofer Declarative Workflow: Implement Feature
// Project: Ideate Platform
// Primary Engine: Antigravity Native (Gemini / Claude Hybrid)

workflow "implement-feature" {
  description = "Standard autonomous feature development with pre-flight verification"
  provider = "antigravity-native"

  step "plan" {
    action = "analyze_requirements"
    inputs = {
      context = ["instruction.md", "css/theme.css"]
      goal = "$input.feature_description"
    }
  }

  step "design_tokens" {
    depends_on = ["plan"]
    action = "verify_design_system"
    inputs = {
      theme_file = "css/theme.css"
      style = "obsidian_dark_liquid_glass"
    }
  }

  step "execute_code" {
    depends_on = ["design_tokens"]
    action = "apply_code_modifications"
    inputs = {
      html_files = ["html/home.html"]
      css_files = ["css/app_home.css"]
      js_files = ["js/app_home.js"]
    }
  }

  step "verify_and_log" {
    depends_on = ["execute_code"]
    action = "qa_audit_and_document"
    inputs = {
      changelog = "history.md"
      roadmap = "instruction.md"
    }
  }
}
