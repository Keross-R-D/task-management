/**
 * Re-export the shared axiosInstance from ikon-react-components-lib.
 *
 * This instance already includes:
 *  - Request interceptor: attaches Bearer token via getValidAccessToken()
 *  - Response interceptor: handles 401 → refreshes token → retries request
 *  - Auto-logout: calls clearTokensAndLogout() if refresh fails
 *
 * No custom interceptors needed — the library handles the full token lifecycle.
 */
export { axiosInstance } from "ikon-react-components-lib";
