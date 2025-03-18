import { Injectable, signal } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products = signal<Product[]>([]);

  constructor(private firestore: Firestore) {
    this.loadProducts();
  }

  private loadProducts() {
    const productsCollection = collection(this.firestore, 'products');

    collectionData(productsCollection, { idField: 'id' }).subscribe((data) => {
      console.log('Datos cargados desde Firestore:', data);

      const productList: Product[] = data.map((product: any) => ({
        id: product.id || 'Sin ID',
        name: product.name || 'Sin nombre',
        description: product.description || 'Sin descripción',
        price: parseFloat(product.price) || 0,
        category: product.category || 'Sin categoría',
        imageUrl: product.imageUrl || 'assets/default-image.jpg',
      }));

      this.products.set(productList);
    });
  }
}
