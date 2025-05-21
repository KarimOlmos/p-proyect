import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  UserCredential,
  updatePassword as updateFirebasePassword,
  updateEmail as updateFirebaseEmail,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { UserData } from '../interfaces/user-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth: Auth;
  private firestore: Firestore;

  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.auth = inject(Auth);
    this.firestore = inject(Firestore);

    // Observar el estado del usuario cuando cambia
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Usuario autenticado detectado al cargar:', user);
        this.userSubject.next(user); // Actualiza el estado del usuario

        // Cargar datos adicionales del usuario desde Firestore
        this.getUserData(user.uid)
          .then((userData) => {
            console.log('Datos adicionales del usuario cargados:', userData);
            this.userSubject.next({ ...user, ...userData }); // Combina los datos de Firebase Auth con los de Firestore
          })
          .catch((error) => {
            console.error('Error al obtener los datos del usuario:', error);
            this.userSubject.next(null); // Si hay un error, establece el estado del usuario como nulo
          });
      } else {
        console.log('No hay usuario autenticado al cargar la aplicación.');
        this.userSubject.next(null); // Establece el estado del usuario como nulo
      }
    });
  }

  /**
   * Espera a que el estado del usuario esté listo.
   * @returns Promise<boolean> - True si el usuario está autenticado, false si no lo está.
   */
  async waitForAuthReady(): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.userSubject.subscribe((user) => {
        if (user !== undefined && user !== null) {
          resolve(!!user); // Resuelve con true si el usuario está autenticado
        }
      });

      const currentUser = this.userSubject.value;
      if (currentUser !== undefined && currentUser !== null) {
        subscription.unsubscribe(); // Cancela la suscripción inmediatamente
        resolve(!!currentUser);
      }
    });
  }

  /**
   * Inicia sesión con correo y contraseña
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Promise<UserCredential>
   */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.userSubject.next(userCredential.user); // Actualiza el estado cuando el login es exitoso
      return userCredential;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @param name Nombre del usuario
   * @param address Dirección del usuario
   * @param age Edad del usuario
   * @returns Promise<User>
   */
  async register(
    email: string,
    password: string,
    name: string,
    address: string,
    age: number
  ): Promise<User> {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Guardar datos en Firestore en la colección 'users'
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, { name, address, age });

      this.userSubject.next(user); // Actualiza el estado cuando el registro es exitoso
      return user;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  /**
   * Retorna el Observable del usuario actual
   */
  get currentUser() {
    return this.userSubject.asObservable(); // Observa el estado del usuario
  }

  /**
   * Retorna el valor actual del usuario
   */
  get currentUserValue(): User | null {
    return this.userSubject.value; // Devuelve el valor actual del BehaviorSubject
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    await this.auth.signOut();
    this.userSubject.next(null); // Actualiza el estado a null cuando el usuario se desloguea
  }

  /**
   * Verifica si el usuario está logueado
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return this.userSubject.value !== null; // Retorna true si el usuario está logueado
  }

  /**
   * Actualiza los datos del usuario en Firestore
   * @param name Nuevo nombre
   * @param address Nueva dirección
   * @param age Nueva edad
   * @param gender Nuevo género (opcional)
   * @param photoURL Nueva URL de la foto (opcional)
   */
  async updateUserData(
    name: string,
    address: string,
    age: number,
    gender?: 'Male' | 'Female',
    photoURL?: string
  ) {
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const updateData: any = { name, address, age };
      if (gender) {
        updateData.gender = gender; // Agrega el género si existe
      }
      if (photoURL) {
        updateData.photoURL = photoURL; // Agrega la URL de la foto si existe
      }
      await updateDoc(userRef, updateData);
    }
  }

  /**
   * Reautentica al usuario y cambia la contraseña
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   */
  async reauthenticateAndChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const credentials = await signInWithEmailAndPassword(this.auth, user.email!, currentPassword);
      await updateFirebasePassword(credentials.user, newPassword);
    }
  }

  /**
   * Obtiene los datos del usuario desde Firestore
   * @param uid ID del usuario
   * @returns Datos del usuario
   */
  async getUserData(uid: string): Promise<UserData> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserData;
      return {
        ...userData,
        photoURL: userData.photoURL || 'https://i.imgur.com/DfIXxgm.jpg', // Valor predeterminado si no hay foto
      };
    } else {
      throw new Error('No se encontraron datos del usuario');
    }
  }

  /**
   * Obtiene los datos completos del usuario actual
   * @returns Datos completos del usuario
   */
  async getCurrentUserFullData(): Promise<any> {
    const isAuthenticated = await this.waitForAuthReady();
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado'); // Lanza un error si no hay usuario
    }

    const user = this.auth.currentUser;
    try {
      // Obtener datos adicionales desde Firestore
      const userData = await this.getUserData(user!.uid);

      // Combinar datos de Firebase Auth con datos de Firestore
      return {
        uid: user!.uid,
        email: user!.email,
        name: userData?.name || 'Usuario desconocido', // Usa un valor predeterminado si no hay nombre
        address: userData?.address || 'Dirección no disponible',
        age: userData?.age || 'Edad no disponible',
      };
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw error;
    }
  }
}
