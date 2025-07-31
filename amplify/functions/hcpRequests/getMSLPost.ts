import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import type { Parameter } from "@aws-sdk/client-ssm";
import axios from "axios";
import type { AxiosInstance } from 'axios';


// Initialize SSM client
const client = new SSMClient({});

// Helper function to get secret values from environment
const getSecretNames = (): string[] => {
  return ["password", "userName", "veeveURL"]
    .map((key) => process.env[key])
    .filter((val): val is string => typeof val === "string");
};

// Fetch secrets from AWS SSM
const command = new GetParametersCommand({
  Names: getSecretNames(),
  WithDecryption: true,
});

let secrets: Record<string, string> = {};

client
  .send(command)
  .then((response) => {
    response.Parameters?.forEach((param: Parameter) => {
      if (param.Name && param.Value) {
        secrets[param.Name] = param.Value;
      }
    });
    console.log("Secrets loaded:", secrets);
  })
  .catch((error) => {
    console.error("Error fetching secrets:", error);
  });

// Axios instance
let instance: AxiosInstance;

const initializeAxios = () => {
  // if (!secrets["veeveURL"]) {
  //   throw new Error("veeveURL not loaded from secrets.");
  // }

  instance = axios.create({
    baseURL: 'https://commtech-candidate-demo.veevavault.com/api/v24.3',//secrets["veeveURL"],
    timeout: 1000,
  });
};

// Fetch data with authentication
export const fetchGetData = async (
  zip: string,
  groupSpecialty: string
) => {
  try {
    if (!instance) initializeAxios();

    const data = {
      username:'natalyasniff@commtech.com',// secrets["userName"],
      password: 'Nis&732799',//secrets["password"],
    };

    const formBody = Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const authResponse = await instance.post("/auth", formBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials":true,
      },
    });

    if (authResponse.data.responseStatus === "SUCCESS") {
      return fetchData(zip, groupSpecialty, authResponse.data.sessionId);
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Fetch protected data
const fetchData = async (
  zip: string,
  groupSpecialty: string,
  sessionId: string
) => {
  try {
    const data = {
      zip,
      groupSpecialty,
    };

    const response = await instance.post(
      "/custom/hcp_request",
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":"*",
          "Access-Control-Allow-Credentials":true,
          "Authorization": sessionId,
        },
      }
    );

    const {
      Id,
      name,
      title,
      email,
      phone,
      firstName,
      lastName,
      company,
      accountId,
    } = response.data;

    return {
      id: Id,
      name,
      title,
      email,
      phone,
      firstName,
      lastName,
      company,
      accountId,
    };
  } catch (error) {
    console.error("Error fetching protected data:", error);
    throw error;
  }
};
