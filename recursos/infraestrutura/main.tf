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

# Imagem Base do Debian
resource "libvirt_volume" "debian_base_image" {
  name   = "debian-12-base.qcow2"
  pool   = "default"
  source = var.debian_image_url
  format = "qcow2"
}

# Discos Virtuais Individuais (Copy-on-Write)
resource "libvirt_volume" "disk_vm1" {
  name           = "disk-vm1-simulador.qcow2"
  pool           = "default"
  base_volume_id = libvirt_volume.debian_base_image.id
  size           = 10737418240 # 10 GB
}

resource "libvirt_volume" "disk_vm2" {
  name           = "disk-vm2-tratamento.qcow2"
  pool           = "default"
  base_volume_id = libvirt_volume.debian_base_image.id
  size           = 10737418240 # 10 GB
}

resource "libvirt_volume" "disk_vm3" {
  name           = "disk-vm3-spark.qcow2"
  pool           = "default"
  base_volume_id = libvirt_volume.debian_base_image.id
  size           = 21474836480 # 20 GB (Big Data/Spark)
}

# Disco Cloud-init
resource "libvirt_cloudinit_disk" "commoninit" {
  name      = "commoninit.iso"
  pool      = "default"
  user_data = file("${path.module}/cloud_init.cfg")
  meta_data = ""
}

# VM 1: Simulador
resource "libvirt_domain" "vm_1" {
  name   = "vm1-simulador"
  memory = "2048"
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.commoninit.id

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  disk {
    volume_id = libvirt_volume.disk_vm1.id
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

# VM 2: Tratamento e Limpeza
resource "libvirt_domain" "vm_2" {
  name   = "vm2-tratamento"
  memory = "2048"
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.commoninit.id

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  disk {
    volume_id = libvirt_volume.disk_vm2.id
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

# VM 3: Big Data (Spark)
resource "libvirt_domain" "vm_3" {
  name   = "vm3-spark"
  memory = "4096"
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.commoninit.id

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  disk {
    volume_id = libvirt_volume.disk_vm3.id
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

# Outputs dos IPs das 3 VMs
output "ips_das_vms" {
  value = {
    vm1_simulador  = try(libvirt_domain.vm_1.network_interface[0].addresses[0], "Consulte via virsh net-dhcp-leases default")
    vm2_tratamento = try(libvirt_domain.vm_2.network_interface[0].addresses[0], "Consulte via virsh net-dhcp-leases default")
    vm3_spark      = try(libvirt_domain.vm_3.network_interface[0].addresses[0], "Consulte via virsh net-dhcp-leases default")
  }
}

# Obter IPs das VMs dinamicamente
resource "local_file" "ansible_inventory" {
  content = <<EOF
[vm_simulador]
vm1 ansible_host=${libvirt_domain.vm_1.network_interface[0].addresses[0]}

[vm_tratamento]
vm2 ansible_host=${libvirt_domain.vm_2.network_interface[0].addresses[0]}

[vm_spark]
vm3 ansible_host=${libvirt_domain.vm_3.network_interface[0].addresses[0]}

[all:vars]
ansible_user=debian
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

  filename = "${path.module}/ansible/inventory.ini"
}