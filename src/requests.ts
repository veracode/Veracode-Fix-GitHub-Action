import axios from 'axios';
import {calculateAuthorizationHeader} from './auth'
import fs from 'fs';
import FormData from 'form-data';
import { selectPlatfrom } from './select_platform';
import * as github from '@actions/github'

// set client identifier
axios.defaults.headers.common['X-CLIENT-TYPE'] = 'fix-github-action';

export async function upload(platform:any, tar:any, options:any) {

    const fileBuffer: Buffer = fs.readFileSync('data.tar.gz');
    const formData = new FormData();
    formData.append('data', fileBuffer, 'data.tar.gz');
    formData.append('name', 'data');
    
    const authHeader = await calculateAuthorizationHeader({
          id: platform.cleanedID,
          key: platform.cleanedKEY,
          host: platform.apiUrl,
          url: '/fix/v1/project/upload_code',
          method: 'POST',
    })

    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - upload')
        console.log('Formdata created')
        console.log(formData)
        console.log('ViD: '+platform.cleanedID+' Key: '+platform.cleanedKEY+' Host: '+platform.apiUrl+' URL: fix/v1/project/upload_code'+' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    console.log('Uploading data.tar.gz to Veracode')

    const response = await axios.post('https://'+platform.apiUrl+'/fix/v1/project/upload_code', formData, {
        headers: {
            'Authorization': authHeader,
            ...formData.getHeaders()
        }
    });

    if (response.status != 200){
        console.log('Error uploading data')
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - upload')
            console.log(response.data)
            console.log('#######- DEBUG MODE -#######')
        }
    }
    else {
        console.log('Data uploaded successfully')
        console.log('Project ID is:')
        console.log(response.data);
        return response.data
    }

}

export async function uploadBatch(credentials:any, tarPath:any, options:any) {

    const platform:any = await selectPlatfrom(credentials)

    const fileBuffer: Buffer = fs.readFileSync(tarPath);
    const formData = new FormData();
    formData.append('data', fileBuffer, 'app.tar.gz');
    formData.append('name', 'data');
    
    const authHeader = await calculateAuthorizationHeader({
          id: platform.cleanedID,
          key: platform.cleanedKEY,
          host: platform.apiUrl,
          url: '/fix/v1/project/batch_upload',
          method: 'POST',
    })

    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - upload')
        console.log('Formdata created')
        console.log(formData)
        console.log('ViD: '+platform.cleanedID+' Key: '+platform.cleanedKEY+' Host: '+platform.apiUrl+' URL: fix/v1/project/batch_upload'+' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    console.log('Uploading app.tar.gz to Veracode')

    const response = await axios.post('https://'+platform.apiUrl+'/fix/v1/project/batch_upload', formData, {
        headers: {
            'Authorization': authHeader,
            ...formData.getHeaders()
        }
    });

    if (response.status != 200){
        console.log('Error uploading data')
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - upload')
            console.log(response.data)
            console.log('#######- DEBUG MODE -#######')
        }
    }
    else {
        console.log('Data uploaded successfully')
        console.log('Project ID is:')
        console.log(response.data);
        return response.data
    }

}


export async function checkFix(platform:any, projectId:any, options:any) {
    const results = await makeRequest(platform, projectId, options);
    return results;
}

async function makeRequest(platform:any, projectId:any, options:any) {
    const authHeader = await calculateAuthorizationHeader({
        id: platform.cleanedID,
        key: platform.cleanedKEY,
        host: platform.apiUrl,
        url: '/fix/v1/project/'+projectId+'/results',
        method: 'GET',
    })

    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - cehckFix')
        console.log('ViD: '+platform.cleanedID+' Key: '+platform.cleanedKEY+' Host: '+platform.apiUrl+' URL: /fix/v1/project/'+projectId+'/results'+' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    const response = await axios.get('https://'+platform.apiUrl+'/fix/v1/project/'+projectId+'/results', {
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })

     if (!response.data) {
        console.log('Response is empty. Retrying in 10 seconds.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        return await makeRequest(platform, projectId, options);
    } else {
        console.log('Fixes fetched successfully');
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - cehckFix')
            console.log('Response:')
            console.log(response.data);
            console.log('#######- DEBUG MODE -#######')
        }
        return response.data;
    }
}

export async function checkFixBatch(platform:any, projectId:any, options:any) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const results = await makeRequestBatch(platform, projectId, options);
    return results;
}

async function makeRequestBatch(credentials:any, projectId:any, options:any) {

    const platform:any = await selectPlatfrom(credentials)

    const authHeader = await calculateAuthorizationHeader({
        id: platform.cleanedID,
        key: platform.cleanedKEY,
        host: platform.apiUrl,
        url: '/fix/v1/project/'+projectId+'/batch_status',
        method: 'GET',
    })

    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - makeRequestBatch')
        console.log('ViD: '+platform.cleanedID+' Key: '+platform.cleanedKEY+' Host: '+platform.apiUrl+' URL: /fix/v1/project/'+projectId+'/results'+' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    const response = await axios.get('https://'+platform.apiUrl+'/fix/v1/project/'+projectId+'/batch_status', {
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })


     if (!response.data) {
        console.log('Response is empty. Something went wrong. No fixes generarted. ');
        return 0
    } else {
        
        console.log('Status fetched successfully');
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - makeRequestBatch')
            console.log('Response:')
            console.log(response.data);
            console.log('#######- DEBUG MODE -#######')
        }

        if ( response.data.hasMore == true){
            console.log('More fixes are being generated. Retrying in 10 seconds.');

            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('requests.ts - makeRequestBatch')
                console.log('Response:')
                console.log(response.data);
                console.log('#######- DEBUG MODE -#######')
            }

            await new Promise(resolve => setTimeout(resolve, 10000));
            return await makeRequestBatch(credentials, projectId, options);
        }
        else {
            return 1;
        }
    }
}

export async function pullBatchFixResults(credentials:any, projectId:any, options:any) {

    await new Promise(resolve => setTimeout(resolve, 5000));

    const platform:any = await selectPlatfrom(credentials)

    const authHeader = await calculateAuthorizationHeader({
        id: platform.cleanedID,
        key: platform.cleanedKEY,
        host: platform.apiUrl,
        url: '/fix/v1/project/'+projectId+'/batch_results',
        method: 'GET',
    })

    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - pullBatchFixResults')
        console.log('ViD: '+platform.cleanedID+' Key: '+platform.cleanedKEY+' Host: '+platform.apiUrl+' URL: /fix/v1/project/'+projectId+'/results'+' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    

    const response = await axios.get('https://'+platform.apiUrl+'/fix/v1/project/'+projectId+'/batch_results', {
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })

     if (!response.data) {
        console.log('Response is empty. Something went wrong. No fixes generarted. ');
        return 0
    } else {
        console.log('Fixes fetched successfully');
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - pullBatchFixResults')
            console.log('Response:')
            console.log(response.data);
            console.log('#######- DEBUG MODE -#######')
        }
        return response.data;
    }
}

export async function getFilesPartOfPR(options:any) {

    const octokit = github.getOctokit(options.token);

    const context = github.context
    const prID:any = context.payload.pull_request?.number
    const repository:any = process.env.GITHUB_REPOSITORY
    const repo = repository.split("/");

    let page = 1;
    let files:any = [];

    while (true) {
        const response = await octokit.request('GET /repos/'+repo[0]+'/'+repo[1]+'/pulls/'+prID+'/files', {
            owner: repo[0],
            repo: repo[1],
            pull_number: prID,
            per_page: 100,
            page: page,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!response.data) {
            console.log('Response is empty. Something went wrong. No files identified. ');
            return 0
        }

        files = files.concat(response.data);

        if (!response.headers.link || !response.headers.link.includes('rel="next"')) {
            break;
        }

        page++;
    }


    if (options.DEBUG == 'true'){
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - getFilesPartOfPR')
        console.log('Files changed in PR:')
        console.log(files);
        console.log('#######- DEBUG MODE -#######')
    }
    return files;
}