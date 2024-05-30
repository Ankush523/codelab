// import React, { useEffect, useState } from 'react';
// import lighthouse from '@lighthouse-web3/sdk';
// import axios from 'axios';

// interface ReceivedIssue {
//   cid: string;
//   fileName: string;
// }

// interface IssueDetails {
//   issuer: string;
//   title: string;
//   description: string;
//   date: string;
// }

// const MyIssues: React.FC = () => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [issues, setIssues] = useState<{ id: number; title: string; description: string; date: string; issuerAddr: string }[]>([]);
//   const [listedIssues, setListedIssues] = useState<ReceivedIssue[]>([]);
//   const [listedIssueDetails, setListedIssueDetails] = useState<{ [key: string]: IssueDetails }>({});
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [issuerAddr, setIssuerAddr] = useState<string | null>(null);
//   const [uploadError, setUploadError] = useState<string | null>(null);

//   const getUploads = async () => {
//     try {
//       const response = await lighthouse.getUploads(
//         "e76d4258.30b9dad0c8b44f7a9555e177270348c3"
//       );
//       return response.data.fileList;
//     } catch (error) {
//       console.error("Failed to fetch files:", error);
//       return [];
//     }
//   };

//   const fetchListedIssueDetails = async (cid: string) => {
//     try {
//       const response = await axios.get(
//         `https://gateway.lighthouse.storage/ipfs/${cid}`
//       );
//       const data = response.data;

//       const issuerMatch = data.match(/Issuer:\s*(.*)/);
//       const titleMatch = data.match(/Title:\s*(.*)/);
//       const descriptionMatch = data.match(/Description:\s*(.*)/);
//       const dateMatch = data.match(/Date:\s*(.*)/);

//       if (issuerMatch && titleMatch && descriptionMatch) {
//         const issueDetails: IssueDetails = {
//           issuer: issuerMatch[1],
//           title: titleMatch[1],
//           description: descriptionMatch[1],
//           date: dateMatch[1],
//         };

//         setListedIssues((prevDetails) => ({
//           ...prevDetails,
//           [cid]: issueDetails,
//         }));
//       }
//     } catch (error) {
//       console.error(`Failed to fetch details for CID ${cid}:`, error);
//       setListedIssues((prevDetails) => ({
//         ...prevDetails,
//         [cid]: { issuer: 'Unknown', title: 'Failed to fetch data', description: 'Failed to fetch data', date: 'Failed to fetch data' },
//       }));
//     }
//   };

//   const fetchListedIssues = async () => {
//     const issueList: any = await getUploads();
//     setListedIssues(issueList);
//     issueList.forEach((issue: any) => {
//       fetchListedIssueDetails(issue.cid);
//     });
//   };

//   useEffect(() => {
//     fetchListedIssues();
//   }, []);

//   const signAuthMessage = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
//         })
//         if (accounts.length === 0) {
//           throw new Error("No accounts returned from Wallet.")
//         }
//         const signerAddress = accounts[0]
//         setIssuerAddr(signerAddress)
//         const { message } = (await lighthouse.getAuthMessage(signerAddress)).data
//         const signature = await window.ethereum.request({
//           method: "personal_sign",
//           params: [message, signerAddress],
//         })
//         return { signature, signerAddress }
//       } catch (error) {
//         console.error("Error signing message with Wallet", error)
//         return null
//       }
//     } else {
//       console.log("Please install Wallet!")
//       return null
//     }
//   }

//   const uploadIssue = async (text: string, name: string) => {
//     try {
//       const response = await lighthouse.uploadText(text, "e76d4258.30b9dad0c8b44f7a9555e177270348c3", name);
//       return response.data.Hash;
//     } catch (error) {
//       console.error('Error uploading issue:', error);
//       setUploadError('Failed to upload issue. Please try again.');
//       throw error;
//     }
//   };

//   const handleOpenDialog = () => {
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setTitle('');
//     setDescription('');
//     setUploadError(null);
//   };

//   const handleSubmit = async () => {
//     const authResponse = await signAuthMessage();
//     if (!authResponse) return;

//     const date = new Date().toDateString();
//     const text = `Issuer: ${authResponse.signerAddress}\nTitle: ${title}\nDescription: ${description}\nDate: ${date}`;
//     try {
//       const cid = await uploadIssue(text, "issue_details");
//       const newIssue = {
//         id: cid,
//         title,
//         description,
//         date,
//         issuerAddr: authResponse.signerAddress,
//       };
//       setIssues([...issues, newIssue]);
//       handleCloseDialog();
//     } catch (error) {
//       console.error('Error submitting issue:', error);
//     }
//   };

//   const handleDelete = (id: number) => {
//     setIssues(issues.filter(issue => issue.id !== id));
//   };

//   return (
//     <div className="p-4">
//       <div className='flex flex-row justify-between'>
//         <h1 className="text-3xl font-semibold mt-4 text-violet-700">My Issues</h1>
//         <button
//           className="relative my-1 w-[30%] border border-violet-900 bg-gradient-to-r from-violet-900 to-purple-400 text-white font-semibold py-2 px-4 rounded-lg shadow transition-shadow duration-300 hover:shadow-none"
//           style={{ boxShadow: "5px 5px 0px 0px black" }}
//           onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "none")}
//           onMouseLeave={(e) =>
//             (e.currentTarget.style.boxShadow = "5px 5px 0px 0px black")
//           }
//           onClick={handleOpenDialog}
//         >
//           Add an Issue
//         </button>
//       </div>

//       <ul className="divide-y divide-gray-200 border border-gray-300 rounded-xl">
//         {listedIssues.map((displayIssue) => (
//           listedIssueDetails[displayIssue.cid]?.title && listedIssueDetails[displayIssue.cid]?.description && listedIssueDetails[displayIssue.cid]?.issuer && (
//             <li
//               key={displayIssue.cid}
//               className="p-4 hover:bg-gray-100 cursor-pointer rounded-xl"
//               // onClick={() => handleFileClick(listedIssueDetails[displayIssue.cid])}
//             >
//               <div className="grid grid-cols-3 gap-4">
//                 <p className="truncate">To: {listedIssueDetails[displayIssue.cid]?.title}</p>
//                 <p className="truncate">Subject: {listedIssueDetails[displayIssue.cid]?.description}</p>
//                 <p className="truncate">Body: {listedIssueDetails[displayIssue.cid]?.issuer}</p>
//               </div>
//               {/* <a
//                 href={`https://gateway.lighthouse.storage/ipfs/${file.cid}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 underline"
//               >
//                 View File
//               </a> */}
//             </li>
//           )
//         ))}
//       </ul>

//       {isDialogOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-[30%] ml-[15%]">
//             <h2 className="text-xl font-semibold mb-4">Create New Issue</h2>
//             <label className="block mb-2">
//               Title:
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="block w-full mt-1 border border-gray-300 rounded-lg p-2"
//               />
//             </label>
//             <label className="block mb-4">
//               Description:
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="block w-full mt-1 border border-gray-300 rounded-lg p-2"
//               />
//             </label>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={handleCloseDialog}
//                 className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-full"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="bg-violet-900 text-white font-semibold py-2 px-6 rounded-full ">
//                 Submit
//               </button>
//             </div>
//             {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
//           </div>
//         </div>
//       )}

//       <ul className="mt-[5%] space-y-4">
//         {issues.map((issue) => (
//           <li key={issue.id} className="border blood-black p-4 rounded-lg shadow-md flex justify-between items-center">
//             <div>
//               <h3 className="text-xl font-semibold">{issue.title}</h3>
//               <p>{issue.description}</p>
//               <p className="text-sm text-gray-500">Date: {issue.date}</p>
//               <p className="text-sm text-gray-500">Issuer: {issue.issuerAddr}</p>
//             </div>
//             <button
//               onClick={() => handleDelete(issue.id)}
//               className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg"
//             >
//               Delete
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MyIssues;

import React, { useEffect, useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";

interface ReceivedIssue {
  cid: string;
  fileName: string;
}

interface IssueDetails {
  issuer: string;
  title: string;
  description: string;
  date: string;
}

const MyIssues: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [issues, setIssues] = useState<
    {
      id: number;
      title: string;
      description: string;
      date: string;
      issuerAddr: string;
    }[]
  >([]);
  const [listedIssues, setListedIssues] = useState<ReceivedIssue[]>([]);
  const [listedIssueDetails, setListedIssueDetails] = useState<{
    [key: string]: IssueDetails;
  }>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuerAddr, setIssuerAddr] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getUploads = async () => {
    try {
      const response = await lighthouse.getUploads(
        "e76d4258.30b9dad0c8b44f7a9555e177270348c3"
      );
      return response.data.fileList;
    } catch (error) {
      console.error("Failed to fetch files:", error);
      return [];
    }
  };

  const fetchListedIssueDetails = async (cid: string) => {
    try {
      const response = await axios.get(
        `https://gateway.lighthouse.storage/ipfs/${cid}`
      );
      const data = response.data;

      const issuerMatch = data.match(/Issuer:\s*(.*)/);
      const titleMatch = data.match(/Title:\s*(.*)/);
      const descriptionMatch = data.match(/Description:\s*(.*)/);
      const dateMatch = data.match(/Date:\s*(.*)/);

      if (issuerMatch && titleMatch && descriptionMatch && dateMatch) {
        const issueDetails: IssueDetails = {
          issuer: issuerMatch[1],
          title: titleMatch[1],
          description: descriptionMatch[1],
          date: dateMatch[1],
        };

        setListedIssueDetails((prevDetails) => ({
          ...prevDetails,
          [cid]: issueDetails,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch details for CID ${cid}:`, error);
      setListedIssueDetails((prevDetails) => ({
        ...prevDetails,
        [cid]: {
          issuer: "Unknown",
          title: "Failed to fetch data",
          description: "Failed to fetch data",
          date: "Failed to fetch data",
        },
      }));
    }
  };

  const fetchListedIssues = async () => {
    const issueList = await getUploads();
    setListedIssues(issueList);
    issueList.forEach((issue: ReceivedIssue) => {
      fetchListedIssueDetails(issue.cid);
    });
  };

  useEffect(() => {
    fetchListedIssues();
  }, []);

  const signAuthMessage = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length === 0) {
          throw new Error("No accounts returned from Wallet.");
        }
        const signerAddress = accounts[0];
        setIssuerAddr(signerAddress);
        const { message } = (await lighthouse.getAuthMessage(signerAddress))
          .data;
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, signerAddress],
        });
        return { signature, signerAddress };
      } catch (error) {
        console.error("Error signing message with Wallet", error);
        return null;
      }
    } else {
      console.log("Please install Wallet!");
      return null;
    }
  };

  const uploadIssue = async (text: string, name: string) => {
    try {
      const response = await lighthouse.uploadText(
        text,
        "e76d4258.30b9dad0c8b44f7a9555e177270348c3",
        name
      );
      return response.data.Hash;
    } catch (error) {
      console.error("Error uploading issue:", error);
      setUploadError("Failed to upload issue. Please try again.");
      throw error;
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTitle("");
    setDescription("");
    setUploadError(null);
  };

  const handleSubmit = async () => {
    const authResponse = await signAuthMessage();
    if (!authResponse) return;

    const date = new Date().toDateString();
    const text = `Issuer: ${authResponse.signerAddress}\nTitle: ${title}\nDescription: ${description}\nDate: ${date}`;
    try {
      const cid = await uploadIssue(text, "issue_details");
      const newIssue = {
        id: cid,
        title,
        description,
        date,
        issuerAddr: authResponse.signerAddress,
      };
      setIssues([...issues, newIssue]);
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting issue:", error);
    }
  };

  const handleDelete = (id: number) => {
    setIssues(issues.filter((issue) => issue.id !== id));
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl font-semibold m-4 text-violet-700">
          My Issues
        </h1>
        <button
          className="relative m-4  w-[15%] border border-violet-900 bg-gradient-to-r from-violet-900 to-purple-400 text-white font-semibold  rounded-lg shadow transition-shadow duration-300 hover:shadow-none"
          style={{ boxShadow: "5px 5px 0px 0px black" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "none")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "5px 5px 0px 0px black")
          }
          onClick={handleOpenDialog}
        >
          Add an Issue
        </button>
      </div>

      <ul className="">
        {listedIssues.map(
          (displayIssue) =>
            listedIssueDetails[displayIssue.cid]?.title &&
            listedIssueDetails[displayIssue.cid]?.description &&
            listedIssueDetails[displayIssue.cid]?.issuer && (
              <li
                key={displayIssue.cid}
                className="border p-3 m-2 hover:bg-gray-100 hover:shadow-lg cursor-pointer rounded-xl"
                // onClick={() => handleFileClick(listedIssueDetails[displayIssue.cid])}
              >
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between">
                    <p className="text-xl font-semibold">
                      {listedIssueDetails[displayIssue.cid]?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Issuer: {listedIssueDetails[displayIssue.cid]?.issuer}
                    </p>
                  </div>
                  <p className="text-lg">
                    {listedIssueDetails[displayIssue.cid]?.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {listedIssueDetails[displayIssue.cid]?.date}
                  </p>
                </div>
                {/* <a
                href={`https://gateway.lighthouse.storage/ipfs/${file.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View File
              </a> */}
              </li>
            )
        )}
      </ul>

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[30%] ml-[15%]">
            <h2 className="text-xl font-semibold mb-4">Create New Issue</h2>
            <label className="block mb-2">
              Title:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full mt-1 border border-gray-300 rounded-lg p-2"
              />
            </label>
            <label className="block mb-4">
              Description:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full mt-1 border border-gray-300 rounded-lg p-2"
              />
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseDialog}
                className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-violet-900 text-white font-semibold py-2 px-6 rounded-full "
              >
                Submit
              </button>
            </div>
            {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
          </div>
        </div>
      )}

      <ul className="mt-[5%] space-y-4">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="border blood-black p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">{issue.title}</h3>
              <p>{issue.description}</p>
              <p className="text-sm text-gray-500">Date: {issue.date}</p>
              <p className="text-sm text-gray-500">
                Issuer: {issue.issuerAddr}
              </p>
            </div>
            <button
              onClick={() => handleDelete(issue.id)}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyIssues;
