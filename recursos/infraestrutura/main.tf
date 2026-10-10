terraform {
  required_version = ">= 1.6.0"
  required_providers {
    libvirt = {
      source  = "dmacvicar/libvirt"
      version = "0.7.1"
    }
  }
}

provider "libvirt" {
  uri = "qemu:///system"
}

# Volume do disco da imagem Debian
resource "libvirt_volume" "debian_image" {
  name   = "debian-12-disk.qcow2"
  pool   = "default"
  source = var.debian_image_url
  format = "qcow2"
}

# Disco do Cloud-init
resource "libvirt_cloudinit_disk" "commoninit" {
  name      = "commoninit.iso"
  pool      = "default"
  user_data = file("${path.module}/cloud_init.cfg")
  meta_data = ""
}

# Criação da Máquina Virtual
resource "libvirt_domain" "domain_debian" {
  name   = var.vm_name
  memory = "2048"
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.commoninit.id

  network_interface {
    network_name   = "default"
    wait_for_lease = false
  }

  disk {
    volume_id = libvirt_volume.debian_image.id
  }

  console {
    type        = "pty"
    target_port = "0"
    target_type = "serial"
  }

  graphics {
    type        = "vnc"
    listen_type = "address"
    autoport    = true
  }
}

output "ip_maquina_virtual" {
  value = try(libvirt_domain.domain_debian.network_interface[0].addresses[0], "IP ainda não atribuído / Aguarde a VM iniciar")
}