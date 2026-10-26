
import { Injectable } from '@angular/core';

import {
  ref,
  push,
  onValue,
  remove,
  update,
  get
} from 'firebase/database';

import { database } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Menyimpan point baru
  savePoint(point: {
    name: string;
    coordinates: string;
    description: string;
  }) {

    const pointsRef =
      ref(database, 'points');

    return push(
      pointsRef,
      point
    );
  }

  // Mengambil semua point
  getPoints(): Promise<any> {

    const pointsRef =
      ref(database, 'points');

    return new Promise((resolve, reject) => {

      onValue(
        pointsRef,
        (snapshot) => {

          resolve(
            snapshot.val()
          );

        },
        (error) => {
          reject(error);
        },
        {
          onlyOnce: true
        }
      );

    });
  }

  // Mengambil satu point berdasarkan key Firebase
  async getPoint(key: string): Promise<any> {

    const pointRef =
      ref(
        database,
        `points/${key}`
      );

    const snapshot =
      await get(pointRef);

    return snapshot.val();
  }

  // Mengubah point
  updatePoint(
    key: string,
    point: {
      name: string;
      coordinates: string;
      description: string;
    }
  ) {

    const pointRef =
      ref(
        database,
        `points/${key}`
      );

    return update(
      pointRef,
      point
    );
  }

  // Menghapus point
  deletePoint(
    key: string
  ) {

    const pointRef =
      ref(
        database,
        `points/${key}`
      );

    return remove(
      pointRef
    );
  }
}
