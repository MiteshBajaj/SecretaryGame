# Future AWS infrastructure

This directory intentionally contains no active AWS infrastructure.

A future production deployment could include:

- A VPC with public and private subnets
- Security groups for the application and load balancer
- An ECR repository for the Docker image
- Compute such as ECS Fargate or EC2
- An application load balancer
- Logging and monitoring resources

Terraform should be added when the hosting requirements, budget, region, scaling needs, and security model have been decided. No AWS resources are created by this project.
