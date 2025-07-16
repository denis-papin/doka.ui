
import {decodeCBOR} from "./helpers.ts";

export interface UploadReply {
    file_ref: string
    size: number
    block_count: number
}


// Helper function to encode file name in base64url format
function base64urlEncode(input: string): string {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Write a routine that post the binary information of the file to the server (multipart/form-data)
// #[post("/upload2/<item_info>", data = "<file_data>")]
// the iten_info will the file name in basee64url encoded format
// in return we get the structure below :
// pub struct UploadReply {
//     pub file_ref: String,
//         pub size: usize,
//         pub block_count: u32,
// }

export async function fileUpload(file : File): Promise<UploadReply> {
    if (!file) {
        throw new Error("No file selected for upload");
    }

    // Add a "sid" header with value : "no7sunaJVabyGe3-_LkD9inQmrlQYaKhl3v3JCaK4zFiweZSK_YisP6SKEtj3UaIBjO8y1yvOyHFJwHZFRi3EndsOorrVgfENrJu8g"

    const headers = new Headers();
    headers.append('sid', 'no7sunaJVabyGe3-_LkD9inQmrlQYaKhl3v3JCaK4zFiweZSK_YisP6SKEtj3UaIBjO8y1yvOyHFJwHZFRi3EndsOorrVgfENrJu8g');
    // headers.append('Content-Type', 'multipart/form-data'); // forbidden in case of form multipart/form-data
    headers.append('Accept', 'application/json');

    // Create a FormData object to hold the file data

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:30080/file-server/upload2/' + base64urlEncode(file.name), {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: UploadReply = await response.json();

        console.log("**** Upload done reply:", data);

        return data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}

export interface UploadInfoReply {
    start_date_time: string      // ISO 8601 date-time string
    item_info: string
    file_reference: string
    session_number: string
    encrypted_count: number
    uploaded_count: number
}

export interface ListOfUploadInfoReply {
    list_of_upload_info: UploadInfoReply[]
}

// Routine that performs a GET on 'http://localhost:30080/file-server/loading/'
// and returns the json structure
export async function getLoadingStatus(): Promise<ListOfUploadInfoReply> {
    try {
        const headers = new Headers();
        headers.append('sid', 'no7sunaJVabyGe3-_LkD9inQmrlQYaKhl3v3JCaK4zFiweZSK_YisP6SKEtj3UaIBjO8y1yvOyHFJwHZFRi3EndsOorrVgfENrJu8g');
        headers.append('Accept', 'application/json')

        const response = await fetch('http://localhost:30080/file-server/loading', {
            method: 'GET',
            headers: headers
        })

        if (!response.ok) {
            throw new Error(`Loading status fetch failed: ${response.statusText}`)
        }

        let listOfUploadInfoReply : ListOfUploadInfoReply = {
            list_of_upload_info : []
        }

        const data = await response.json()

        listOfUploadInfoReply.list_of_upload_info = data.list_of_upload_info;

        console.log("**** Loading status:", data)

        return listOfUploadInfoReply;
    } catch (error) {
        console.error("Loading status error:", error)
        throw error
    }
}

/// CBOR / HARBOR

export interface ListOfUploadWatchInfoHarbor {
    uploading_files: UploadWatchInfoHarbor[]
}

export interface UploadWatchInfoHarbor {
    file_name: string
    file_ref?: string
    percent_of_completion: number
}

// const dokaObjects = ref<ListOfUploadWatchInfoHarbor|undefined>(undefined)

export const fetchUploadWatchInfo = async () : Promise<ListOfUploadWatchInfoHarbor> => {
    const response = await fetch('http://127.0.0.1:3000/harbor/cbor/upload_watch')
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
    }
    const cborBinary = await response.arrayBuffer()
    const val : ListOfUploadWatchInfoHarbor = await decodeCBOR(cborBinary)
    console.log('>>> list of objects', val)
    return val
}
