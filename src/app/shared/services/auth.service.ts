import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { UserType } from "@shared/types/UserType";
import { firstValueFrom, Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    public user: WritableSignal<UserType | null> = signal<UserType | null>(null);

    private httpClient: HttpClient = inject(HttpClient);

    public async signUp(email: string, name: string, surname: string, password: string): Promise<UserType> {
        return await firstValueFrom(this.httpClient.post<UserType>(environment.serverURL + "/auth/signup", {
            email,
            name,
            surname,
            password
        })).then((user: UserType) => {
            this.getAuthenticatedUser();

            return user;
        });
    }

    public async logIn(email: string, password: string): Promise<UserType> {
        return await firstValueFrom(this.httpClient.post<UserType>(environment.serverURL + "/auth/login", {
            email,
            password
        })).then((user: UserType) => {
            this.getAuthenticatedUser();

            return user;
        });
    }

    public async getAuthenticatedUser(): Promise<UserType> {
        return await firstValueFrom(this.httpClient.get<UserType>(environment.serverURL + "/auth/user"))
            .then((user: UserType) => {
                this.user.set(user);
                return user;
            });
    }

    public async updateUserName(newUserName: string, newUserSurname: string): Promise<UserType> {
        return await firstValueFrom(this.httpClient.put<UserType>(environment.serverURL + "/users", { name: newUserName, surname: newUserSurname }))
            .then((user: UserType) => {
                this.user.set(user);
                return user;
            });
    }

    public async logOut(): Promise<void> {
        return await firstValueFrom(this.httpClient.post<void>(environment.serverURL + "/auth/logout", {}))
            .then(() => {
                this.user.set(null);
            });
    }

    public refreshToken(): Observable<void> {
        return this.httpClient.post<void>(environment.serverURL + "/auth/refresh", {});
    }

    public async init(): Promise<void> {
        await this.getAuthenticatedUser()
            .catch(() => {
                this.user.set(null);
            });
    }
}