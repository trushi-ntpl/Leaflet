// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'leaflet-map-app';
// }
import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { latLng, tileLayer, marker, Marker } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  map: any;
  drawnItems: any;
  markers: Marker[] = [];
  data: any = [];

  ngOnInit(): void {
    // Fetching data from an external source on init
    this.fetchData();
  }

  ngAfterViewInit(): void {
    // Initialize the map
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13,
    });

    // Add tile layer (OpenStreetMap)
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // Initialize the drawn items layer for shapes
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    // Set up the Leaflet draw control for shapes
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: {
        polygon: false,
        rectangle: false,
        circle: false,
        marker: false, // Disables marker draw tool
        polyline: false,
        circlemarker: false,
      },
    });

    this.map.addControl(drawControl);

    // Handle the draw events to add shapes
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
    });

    // Handle marker placement
    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
      this.addMarker(lat, lng);
    });
  }

  // Fetch data using the fetch API
  fetchData(): void {
    fetch('https://api.example.com/markers')  // Replace with your actual URL
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data);
        this.data = data;  // Assign the data to be used later, e.g., for markers
        this.loadMarkers();
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  // Example method to load markers from fetched data
  loadMarkers(): void {
    this.data.forEach((item: any) => {
      const lat = item.lat;
      const lng = item.lng;
      this.addMarker(lat, lng);  // Assuming data contains lat and lng
    });
  }

  // Add marker to the map
  addMarker(lat: number, lng: number): void {
    const newMarker = marker([lat, lng], {
      draggable: true,
    }).addTo(this.map);

    // Save reference to the marker for future actions
    this.markers.push(newMarker);

    // Add event listeners to edit the marker
    newMarker.on('dragend', () => {
      this.updateMarker(newMarker);
    });

    newMarker.on('click', () => {
      this.renameMarker(newMarker);
    });
  }

  // Rename marker functionality
  renameMarker(marker: Marker): void {
    const newName = prompt('Enter marker name:', 'My Marker');
    if (newName) {
      marker.bindTooltip(newName).openTooltip();
    }
  }

  // Update marker position on drag
  updateMarker(marker: Marker): void {
    const position = marker.getLatLng();
    console.log('Marker updated to:', position);
  }

  // Remove marker from the map
  removeMarker(marker: Marker): void {
    this.map.removeLayer(marker);
    this.markers = this.markers.filter((m) => m !== marker);
  }
}
