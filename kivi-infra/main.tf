terraform {
    required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"
      }
    }
  }

  provider "aws" {
    region = "ap-south-1"  # Mumbai — change to your preferred region
  }

  # Use existing key pair or create one via AWS Console first
  variable "key_pair_name" {
    description = "Name of your AWS EC2 key pair for SSH access"
    type        = string
  }

  # Latest Ubuntu 22.04 LTS AMI (auto-resolves per region)
  data "aws_ami" "ubuntu" {
    most_recent = true
    owners      = ["099720109477"] # Canonical

    filter {
      name   = "name"
      values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    }
  }

  resource "aws_security_group" "kivi_worker" {
    name        = "kivi-worker-sg"
    description = "Kivi transcoding worker"

    # SSH access
    ingress {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]  # Restrict to your IP in production
    }

    # All outbound (needs to reach Redis, R2, PostgreSQL)
    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  resource "aws_instance" "kivi_worker" {
    ami                    = data.aws_ami.ubuntu.id
    instance_type          = "t3.medium"  # 2 vCPU, 4GB RAM — good for FFmpeg
    key_name               = var.key_pair_name
    vpc_security_group_ids = [aws_security_group.kivi_worker.id]

    root_block_device {
      volume_size = 20  # GB — tmp space for transcoding
      volume_type = "gp3"
    }

    tags = {
      Name = "kivi-transcoding-worker"
    }
  }

  output "worker_ip" {
    value       = aws_instance.kivi_worker.public_ip
    description = "SSH into this IP to set up the worker"
  }
