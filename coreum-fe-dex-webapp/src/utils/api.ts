import axios, { AxiosResponse } from "axios";
import { config } from "@/config/envs";
import { useStore } from "@/state";

export enum APIMethod {
  GET = "get",
  POST = "post",
  UPDATE = "put",
  DELETE = "delete",
  POST_FILE = "postFile",
}

export enum Services {
  AUTH = "auth",
  KYC = "kyc",
  ASSET = "asset",
}

const defineService = (service: Services) => {
  switch (service) {
    case Services.KYC:
      return config?.KYC_API;
    case Services.AUTH:
      return config?.ACCOUNT_API;
    case Services.ASSET:
      return config?.ASSET_API;
  }
};

//TODO what is service going to be here? auth, etc
export const request = async (
  body: any,
  endpoint: string,
  method: APIMethod,
  service: Services = Services.AUTH
): Promise<AxiosResponse> => {
  const serviceUrl = defineService(service);

  let headers: any = {
    "Content-Type": "application/json",
    Network: useStore.getState().network,
  };

  let response: any;

  if (method === APIMethod.POST_FILE) {
    headers["Content-Type"] = "multipart/form-data";
    const form = new FormData();
    form.append("file", body.Filename);
    response = await axios
      .post(`${serviceUrl}${endpoint}`, form, { headers })
      .then((res: any) => res)
      .catch((error: any) => {
        console.log("E_REQUEST =>", error);
        if (
          error.response?.status === 401 &&
          (error.response?.data?.includes("unauthorized") ||
            error.response?.data?.includes("invalid token"))
        ) {
          console.log(error.response);
        }
        throw error;
      });
  } else {
    response = await axios({
      headers,
      method,
      url: `${serviceUrl}${endpoint}`,
      ...(method === APIMethod.GET ? { params: body } : { data: body }),
    })
      .then((res: any) => res)
      .catch((error: any) => {
        console.log("E_REQUEST =>", error);
        if (
          (error.response?.status === 401 &&
            error.response?.data?.message === "unauthorized") ||
          error.response?.data?.includes("unauthorized") ||
          error.response?.data?.includes("invalid token")
        ) {
          console.log(error.response);
        }
        throw error;
      });
  }

  return response;
};
