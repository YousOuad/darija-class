# =============================================================================
# DarijaLingo - Terraform Variables (Minimal)
# =============================================================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "darijalingo"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# Database
variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "darija"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

# Application
variable "jwt_secret_key" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for Claude"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS (Netlify)"
  type        = string
  default     = "https://darijalingo.netlify.app"
}
