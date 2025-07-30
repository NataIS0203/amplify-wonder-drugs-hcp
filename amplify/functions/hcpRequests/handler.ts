import axios from 'axios';
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import type { Parameter } from "@aws-sdk/client-ssm";

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

export const handler =
async (
  event: { body: string }
): Promise<{ statusCode: number ; body: string; headers?: Record<string, string>}> => 
{
  try {
    const { zip, groupSpecialty} = JSON.parse(event.body || '{}');

    const requestData = {
      zip,
      groupSpecialty,
    };

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

    const authResponse = await axios.post("/auth", formBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    });

    if (authResponse.data.responseStatus === "SUCCESS") {
      try {
     const response = await axios.post(
      'https://commtech-candidate-demo.veevavault.com/api/v24.3/custom/hcp_request',
      JSON.stringify(requestData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          Authorization: authResponse.data.sessionId,
        },
      }
    )
    const {
      Id: id,
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
      statusCode: 200,
      body: JSON.stringify({
        id,
        name,
        title,
        email,
        phone,
        firstName,
        lastName,
        company,
        accountId,
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };
  }
    catch (error: any) {
    console.error('Error in fetchData Lambda:', error);

     return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch data',
        details: error.message,
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };
  }
 }
 } catch (error: any) {
    console.error('Error in fetchData Lambda:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch data',
        details: error.message,
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };    
  }
  // Fallback return in case no other return is hit
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Unknown error occurred',
    }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
  };
};
