import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import * as L from 'leaflet';

import { DataService } from '../data.service';

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage {

  map!: L.Map;

  key = '';
  name = '';
  coordinates = '';
  description = '';

  // Definisi ikon marker CDN transparan untuk halaman edit
  private readonly defaultMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  async ionViewDidEnter() {
    this.key = this.route.snapshot.paramMap.get('key') || '';

    if (!this.key) {
      await this.showAlert('Error', 'Key point tidak ditemukan.');
      this.navCtrl.back();
      return;
    }

    try {
      const point: any = await this.dataService.getPoint(this.key);

      if (!point) {
        await this.showAlert(
          'Error',
          'Data point tidak ditemukan di Firebase.'
        );
        this.navCtrl.back();
        return;
      }

      this.name = point.name || '';
      this.coordinates = point.coordinates || '';
      this.description = point.description || '';

      const latLng = this.coordinates
        .split(',')
        .map((value: string) => parseFloat(value.trim()));

      if (
        latLng.length !== 2 ||
        !latLng.every((value: number) => Number.isFinite(value))
      ) {
        await this.showAlert(
          'Error',
          'Format koordinat point tidak valid.'
        );
        return;
      }

      // Membersihkan peta sebelumnya jika halaman dibuka ulang
      if (this.map) {
        this.map.remove();
        this.map = undefined as any;
      }

      // Membuat peta
      this.map = L.map('mapedit').setView(
        [latLng[0], latLng[1]],
        13
      );

      // OpenStreetMap
      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      // Esri World Imagery
      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri'
        }
      );

      osm.addTo(this.map);

      const baseMaps = {
        'OpenStreetMap': osm,
        'Esri World Imagery': esri
      };

      L.control.layers(baseMaps).addTo(this.map);

      // Marker dapat digeser dengan ikon transparan eksplisit
      const marker = L.marker(
        [latLng[0], latLng[1]],
        {
          icon: this.defaultMarkerIcon,
          draggable: true
        }
      ).addTo(this.map);

      marker.bindPopup(
        'Geser marker untuk mengubah koordinat lokasi.'
      );

      marker.openPopup();

      // Memperbarui koordinat setelah marker digeser
      marker.on('dragend', () => {
        const position = marker.getLatLng();

        this.coordinates =
          `${position.lat.toFixed(9)},${position.lng.toFixed(9)}`;
      });

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);

    } catch (error: any) {
      console.error('Gagal memuat point:', error);

      await this.showAlert(
        'Gagal Memuat Data',
        error?.message || 'Data point gagal dimuat.'
      );
    }
  }

  // Menyimpan perubahan point
  async save() {
    if (!this.name.trim() || !this.coordinates.trim()) {
      await this.showAlert(
        'Data Belum Lengkap',
        'Nama dan koordinat harus diisi.'
      );
      return;
    }

    try {
      await this.dataService.updatePoint(this.key, {
        name: this.name.trim(),
        coordinates: this.coordinates.trim(),
        description: this.description
      });

      await this.showAlert(
        'Berhasil',
        'Perubahan point berhasil disimpan.'
      );

      // Kembali ke halaman peta utama
      this.router.navigate(['/maps']);

    } catch (error: any) {
      console.error('Gagal menyimpan point:', error);

      await this.showAlert(
        'Save Failed',
        error?.message || 'Perubahan point gagal disimpan.'
      );
    }
  }

  // Menampilkan pesan
  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Membersihkan peta ketika meninggalkan halaman
  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }
}