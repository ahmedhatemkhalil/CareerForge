import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/services/auth.service";
import { inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isAdmin()) {
    return true;
  } else {
    toastr.error("Access Denied: You are not an admin");
    router.navigate(['/dashboard']);
    return false;
  }
};
