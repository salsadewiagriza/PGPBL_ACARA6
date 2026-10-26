import { Component } from '@angular/core';
import * as L from 'leaflet';
import { Router } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage {

  map!: L.Map;

  // Menggunakan URL CDN resmi Leaflet untuk menjamin transparansi gambar PNG
  private readonly defaultMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ionViewDidEnter() {

    // Mencegah peta dibuat berulang kali
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }

    setTimeout(() => {

      // Membuat peta
      this.map = L.map('map').setView(
        [-7.7956, 110.3695],
        13
      );

      // OpenStreetMap
      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors'
        }
      );

      osm.addTo(this.map);

      // Memuat point Firebase
      this.loadPoints();

      // Memperbaiki ukuran peta
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);

    }, 300);
  }

  async loadPoints() {

    try {

      const points: any =
        await this.dataService.getPoints();

      console.log('Data points:', points);

      if (!points) {
        console.log('Belum ada point di Firebase');
        return;
      }

      // Perulangan setiap point
      for (const key in points) {

        if (
          !Object.prototype.hasOwnProperty.call(
            points,
            key
          )
        ) {
          continue;
        }

        const point = points[key];

        // Memeriksa data point
        if (
          !point ||
          typeof point.coordinates !== 'string'
        ) {
          console.error(
            'Koordinat point tidak tersedia:',
            point
          );
          continue;
        }

        // Mengubah koordinat menjadi angka
        const coordinates =
          point.coordinates
            .split(',')
            .map(
              (c: string) =>
                parseFloat(c.trim())
            );

        // Memvalidasi koordinat
        if (
          coordinates.length !== 2 ||
          !coordinates.every(
            (coordinate: number) =>
              Number.isFinite(coordinate)
          ) ||
          coordinates[0] < -90 ||
          coordinates[0] > 90 ||
          coordinates[1] < -180 ||
          coordinates[1] > 180
        ) {
          console.error(
            'Koordinat point tidak valid:',
            point
          );
          continue;
        }

        // Marker biru bawaan Leaflet dengan shadow PNG
        const marker = L.marker(
          coordinates as L.LatLngExpression,
          {
            icon: this.defaultMarkerIcon
          }
        ).addTo(this.map);

        // Popup Edit dan Hapus (Menggunakan button agar event click tertangkap sempurna)
        marker.bindPopup(`
          <div style="min-width: 130px; text-align: center;">
            <strong>${this.escapeHtml(String(point.name || 'Point'))}</strong>
            <br><br>

            <button
              type="button"
              id="edit-btn-${key}"
              class="edit-link"
              title="Edit point"
              aria-label="Edit point"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #3880ff;
                color: white;
                border: none;
                padding: 6px 9px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 5px;
                vertical-align: middle;
              ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            <button
              type="button"
              id="delete-btn-${key}"
              class="delete-link"
              title="Hapus point"
              aria-label="Hapus point"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #eb445a;
                color: white;
                border: none;
                padding: 6px 9px;
                border-radius: 5px;
                cursor: pointer;
                vertical-align: middle;
              ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14H6L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M9 6V4h6v2"></path>
              </svg>
            </button>
          </div>
        `);

        // Menangani aksi klik saat popup terbuka
        marker.on('popupopen', () => {

          const editBtn = document.getElementById(`edit-btn-${key}`);
          const deleteBtn = document.getElementById(`delete-btn-${key}`);

          // Handler Tombol Edit
          if (editBtn) {
            editBtn.onclick = (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              if (this.map) {
                this.map.closePopup();
              }

              // Navigasi ke editpoint membawa parameter key
              this.router.navigate(['/editpoint', String(key)]);
            };
          }

          // Handler Tombol Hapus
          if (deleteBtn) {
            deleteBtn.onclick = async (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              await this.deletePoint(key, marker.getLatLng());
            };
          }
        });
      }

    } catch (error) {

      console.error(
        'Gagal memuat points:',
        error
      );
    }
  }

  // Mengamankan teks sebelum dimasukkan ke popup HTML
  private escapeHtml(value: string): string {

    return value.replace(/[&<>"']/g, (character) => {

      const entities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      return entities[character];
    });
  }

  // Menghapus point dari Firebase dan peta
  async deletePoint(
    key: string,
    latLng: L.LatLng | undefined
  ) {

    try {

      // Hapus data dari Firebase
      await this.dataService.deletePoint(key);

      // Hapus marker yang sesuai dari peta
      if (latLng && this.map) {

        this.map.eachLayer((layer) => {

          if (layer instanceof L.Marker) {

            if (layer.getLatLng().equals(latLng)) {
              this.map.removeLayer(layer);
            }
          }
        });
      }

      if (this.map) {
        this.map.closePopup();
      }

      console.log(
        'Point berhasil dihapus:',
        key
      );

    } catch (error) {

      console.error(
        'Gagal menghapus point:',
        error
      );
    }
  }

  ionViewWillLeave() {

    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }
}