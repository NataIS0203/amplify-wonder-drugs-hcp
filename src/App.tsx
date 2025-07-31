import { useState ,  type SetStateAction } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import reactLogo from './assets/WDHCP.jpg'
import type { MSLResponse } from './MSLResponse';

function App() {
  
const client = generateClient<Schema>();

  const { user, signOut } = useAuthenticator();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [NPINumber, setNPINumber] = useState('');
  const [zip, setZip] = useState('');
  const [specialty, setSpecialty] = useState('');
  
  const handleNameChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setEmail(event.target.value);
  };

  const handlePhoneChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setPhone(event.target.value);
  };
  
  const handleNPINumberChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setNPINumber(event.target.value);
  };
  
  const handleZipChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setZip(event.target.value);
  };
  
  const handleSpecialtyChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSpecialty(event.target.value);
  };

  const [responseData, setResponseData] = useState<MSLResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseData(null);

  await client.queries.MSLResponses({
      request: JSON.stringify({
        zip:  zip,
        specialty: specialty
      })
    }).then(response => {
      console.log('Response:', response);
       if(response.data?.statusCode == '200') {
        const jsonResponse: MSLResponse = JSON.parse(response.data?.body || '{}');
      setResponseData(jsonResponse); 
      setLoading(false);
       }
    }).catch(error => {
      console.error('Error fetching MSL response:', error);
    })
  }

  return (
    <main className="main" >
      <h1>{user?.signInDetails?.loginId}'s request</h1> <div>
        <img src={reactLogo} className="logo" alt="HCP logo" />
      </div>
      <h3>Search for MSL</h3>
      <div>
        <p>
          <label htmlFor="nameInput" className='param'>HCP Name: </label>
          <input className='field'
            type="text"
            id="nameInput"
            value={name}
            onChange={handleNameChange}
          />
        </p>
        <p>
          <label htmlFor="nameInput" className='param'>HCP email: </label>
          <input className='field'
            type="text"
            id="emailInput"
            value={email}
            onChange={handleEmailChange}
          />
        </p>
        <p>
          <label htmlFor="nameInput" className='param'>HCP phone: </label>
          <input className='field'
            type="text"
            id="phoneInput"
            value={phone}
            onChange={handlePhoneChange}
          />
        </p>
        <p>
          <label htmlFor="nameInput" className='param'>NPINumber: </label>
          <input className='field'
            type="text"
            id="NPINumber"
            value={NPINumber}
            onChange={handleNPINumberChange}
          />
        </p>
        <p>
          <label htmlFor="nameInput" className='param'>HCP zip code: </label>
          <input className='field'
            type="text"
            id="zipInput"
            value={zip}
            onChange={handleZipChange}
          />
        </p>
        <p>
          <label htmlFor="nameInput" className='param'>HCP Specialty: </label>
          <input className='field'
            type="text"
            id="groupSpecialtyInput"
            value={specialty}
            onChange={handleSpecialtyChange}
          />
        </p>
        </div>
        <div>
      <h2>Send Input to API</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {responseData && (
        <div>
          <h3>Response:</h3>
          <ul><li key={responseData.id}>{responseData.id}</li>
            <li key={responseData.name}>{responseData.name}</li>
            <li key={responseData.title}>{responseData.title}</li>
            <li key={responseData.email}>{responseData.email}</li>
            <li key={responseData.phone}>{responseData.phone}</li>
            <li key={responseData.company}>{responseData.company}</li></ul>
        </div>
      )}
    </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
export default App;
