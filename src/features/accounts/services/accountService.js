import { apiRequest } from "../../../services/apiClient.js";

export function getAccountsByCustomerId(customerId) {
  return apiRequest(
    `/accounts/customer/${encodeURIComponent(customerId)}`
  );
}

export function getAccount(accountId) {
  return apiRequest(
    `/accounts/${encodeURIComponent(accountId)}`
  );
}