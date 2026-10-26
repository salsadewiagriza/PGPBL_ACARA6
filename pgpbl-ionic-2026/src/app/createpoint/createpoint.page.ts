import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

import * as L from 'leaflet';

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {

  map!: L.Map;

  name = '';
  coordinates = '';
  description = '';

  editMode = false;
  pointKey: string | null = null;

  // Konfigurasi ikon transparan dengan CDN resmi Leaflet
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

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {

    setTimeout(() => {

      const initialLat = -7.7956;
      const initialLng = 110.3695;

      // Set nilai default awal ke input koordinat
      this.coordinates = `${initialLat},${initialLng}`;

      this.map = L.map('mapcreate').setView(
        [initialLat, initialLng],
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
          attribution: 'ESRI'
        }
      );

      // Default layer
      osm.addTo(this.map);

      // Layer control
      const baseMaps = {
        'OpenStreetMap': osm,
        'Esri World Imagery': esri
      };

      L.control
        .layers(baseMaps)
        .addTo(this.map);

      // Marker dengan penetapan opsi icon eksplisit
      const marker = L.marker(
        [initialLat, initialLng],
        {
          icon: this.defaultMarkerIcon,
          draggable: true
        }
      );

      marker.addTo(this.map);

      // Popup
      const tooltip =
        'Drag the marker or move the map<br>' +
        'to change the coordinates<br>' +
        'of the location';

      marker.bindPopup(tooltip);
      marker.openPopup();

      // Event saat marker selesai digeser
      marker.on('dragend', (e) => {

        const latlng = e.target.getLatLng();

        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);

        this.coordinates = lat + ',' + lng;

        console.log('Coordinates:', this.coordinates);
      });

      // Mengoptimalkan ulang ukuran canvas peta setelah dirender
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);

    }, 500);
  }

  async save() {

    if (this.name && this.coordinates && this.description) {

      try {

        const pointData = {
          name: this.name,
          coordinates: this.coordinates,
          description: this.description
        };

        if (this.editMode && this.pointKey) {

          await this.dataService.updatePoint(
            this.pointKey,
            pointData
          );

        } else {

          await this.dataService.savePoint(
            pointData
          );

        }

        this.router.navigate(['/maps']);

      } catch (error: any) {

        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });

        await alert.present();
      }
    }
  }
}