import fs from 'fs';
import { createFlawInfo } from './createFlawInfo';
import { checkCWE } from './check_cwe_support';
import tarModule from 'tar';
import { uploadBatch, checkFixBatch, pullBatchFixResults, getFilesPartOfPR } from './requests'
import { createPRCommentBatch } from './create_pr_comment'
import { execSync }  from 'child_process';
import { createCheckRun, updateCheckRunClose, updateCheckRunUpdateBatch } from './checkRun';
import { rewritePath } from './rewritePath'
import { createPR } from './create_pr'

import { sourcecodeFolderName } from './constants';
import {tempFolder} from './constants'
export async function runBatch( options:any, credentials:any){

    //read json file
    const jsonRead = fs.readFileSync(options.file, 'utf8')
    const jsonData = JSON.parse(jsonRead);
    const jsonFindings = jsonData.findings
    const flawCount = jsonFindings.length
    console.log('Number of flaws: '+flawCount)

    let filesPartOfPR:any = {}
    if (process.env.GITHUB_EVENT_NAME == 'pull_request'){
        filesPartOfPR = await getFilesPartOfPR(options)
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('run_batch.ts - runBatch()')
            console.log('Files part of PR:')
            console.log(filesPartOfPR)
            console.log('#######- DEBUG MODE -#######')
        }
        
        
    }

    //loop through json file and create a new array
    let i = 0
    let flawArray:any = {}
    for (i = 0; i < flawCount; i++) {

        //create a new array per source file
        let sourceFile = jsonFindings[i].files.source_file.file;

        if (!flawArray[sourceFile]) {
            flawArray[sourceFile] = [];
        }
        flawArray[sourceFile].push(jsonFindings[i]);
    }

    //loop through the new array per source file and find fixable flaws, supported CWE's and CWE's to be fixed
    let sourceFiles = Object.keys(flawArray);
    const sourceFilesCount = sourceFiles.length
    console.log('Number of source files with flaws: '+sourceFilesCount)
    for (let i = 0; i < sourceFilesCount; i++) {

        console.log('#############################\n\n')

        let sourceFile = sourceFiles[i];
        console.log('Source file with flaws:', sourceFile);

        let j = 0
        let flawCount = flawArray[sourceFile].length
        console.log('Number of flaws for '+sourceFile+': '+flawCount)

        for (j = 0; j < flawCount; j++) {

            const initialFlawInfo = {
                resultsFile: options.file,
                issuedID: flawArray[sourceFile][j].issue_id,
                cweID: parseInt(flawArray[sourceFile][j].cwe_id),
                language: options.language,
                sourceFile: sourceFile,
            }
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('initialFlawInfo',initialFlawInfo)
                console.log('#######- DEBUG MODE -#######')
            }

            let include = 0
            if ( options.files == 'changed' ){
                console.log('Checking if file is part of PR')
                //sourceFile needs rewrite before checking if its part of the PR

                const filepath = await rewritePath(options, sourceFile)

                if (process.env.GITHUB_EVENT_NAME == 'pull_request'){
                    for (let key in filesPartOfPR) {
                        if (filesPartOfPR[key].filename === filepath) {
                            include = 1
                            //console.log('File is part of PR')
                            break;
                        }
                    }
                }
                else {
                    console.log('Not a PR, all files should be fixed')
                    include = 1
                }
            }

            if ( include == 0 && options.files == 'changed' ){
                console.log('File is not part of PR, and only changed files should be fixed. -> Parameter "files" is set to "changed"')
            }
            else {
                console.log('File is part of PR, either all files should be fixed or this file is part of changed files to be fixed')

                if (options.cwe != '') {

                    console.log('Fix only for CWE: '+options.cwe)

                    //get CWE list input
                    let cweList = [];
                    if (options.cwe.includes(',')) {
                        cweList = options.cwe.split(',');
                    } else {
                        cweList = [options.cwe];
                    }

                    if (cweList.includes(flawArray[sourceFile][j].cwe_id)) {
                        console.log('CWE '+flawArray[sourceFile][j].cwe_id+' is in the list of CWEs to fix, creating flaw info')
                        
                        if (await checkCWE(initialFlawInfo, options, true) == true){
                            const flawInfo = await createFlawInfo(initialFlawInfo,options)

                            if (options.DEBUG == 'true'){
                                console.log('#######- DEBUG MODE -#######')
                                console.log('run_batch.ts - runBatch()')
                                console.log('Flaw Info:',flawInfo)
                                console.log('#######- DEBUG MODE -#######')
                            }

                            //write flaw info and source file
                            const flawFoldername = 'cwe-'+flawInfo.CWEId+'-line-'+flawInfo.line+'-issue-'+flawInfo.issueId
                            const flawFilenane = 'flaw_'+flawInfo.issueId+'.json'
                            console.log(`Writing flaw to: ${tempFolder + sourcecodeFolderName}`+flawFoldername+'/'+flawFilenane)
                            fs.mkdirSync(tempFolder + sourcecodeFolderName + 'flaws/'+flawFoldername, { recursive: true });
                            fs.writeFileSync(tempFolder + sourcecodeFolderName + '/flaws/'+flawFoldername+'/'+flawFilenane, JSON.stringify(flawInfo, null, 2))

                            if (fs.existsSync(tempFolder + sourcecodeFolderName + flawInfo.sourceFile)) {
                                console.log('File exists nothing to do');
                            } else {
                                console.log('File does not exist, copying file');
                                let str = flawInfo.sourceFile;
                                let lastSlashIndex = str.lastIndexOf('/');
                                let strBeforeLastSlash = str.substring(0, lastSlashIndex);
                                if (!fs.existsSync(tempFolder + sourcecodeFolderName + strBeforeLastSlash)) {
                                    console.log('Destination directory does not exist lest create it');
                                    fs.mkdirSync(tempFolder + sourcecodeFolderName + strBeforeLastSlash, { recursive: true });
                                }

                                fs.copyFileSync(flawInfo.sourceFile, tempFolder + sourcecodeFolderName + flawInfo.sourceFile);
                            }
                        }
                        else {
                            console.log('CWE '+flawArray[sourceFile][j].cwe_id+' is not supported for '+options.language)
                        }
                    }
                    else {
                        console.log('CWE '+flawArray[sourceFile][j].cwe_id+' is not in the list of CWEs to fix')
                    }
                }
                else {
                    console.log('Fix for all CWEs')

                    if (await checkCWE(initialFlawInfo, options, true) == true){
                        const flawInfo = await createFlawInfo(initialFlawInfo,options)
                        
                        //write flaw info and source file
                        const flawFoldername = 'cwe-'+flawInfo.CWEId+'-line-'+flawInfo.line+'-issue-'+flawInfo.issueId
                        const flawFilenane = 'flaw_'+flawInfo.issueId+'.json'
                        console.log(`Writing flaw to: ${tempFolder + sourcecodeFolderName}`+flawFoldername+'/'+flawFilenane)
                        fs.mkdirSync(tempFolder + sourcecodeFolderName+'flaws/'+flawFoldername, { recursive: true });
                        fs.writeFileSync(tempFolder + sourcecodeFolderName+'flaws/'+flawFoldername+'/'+flawFilenane, JSON.stringify(flawInfo, null, 2))

                        if (fs.existsSync(tempFolder + sourcecodeFolderName+flawInfo.sourceFile)) {
                            console.log('File exists nothing to do');
                        } else {
                            console.log('File does not exist, copying file');
                            let str = flawInfo.sourceFile;
                            let lastSlashIndex = str.lastIndexOf('/');
                            let strBeforeLastSlash = str.substring(0, lastSlashIndex);
                            if (!fs.existsSync(tempFolder + sourcecodeFolderName+strBeforeLastSlash)) {
                                console.log('Destination directory does not exist lest create it');
                                fs.mkdirSync(tempFolder + sourcecodeFolderName+strBeforeLastSlash, { recursive: true });
                            }

                            fs.copyFileSync(flawInfo.sourceFile, tempFolder + sourcecodeFolderName+flawInfo.sourceFile)
                        }

                    }
                    else {
                        console.log('CWE '+flawArray[sourceFile][j].cwe_id+' is not supported for '+options.language)
                    }
                }
            }
        }
    };

    if (!fs.existsSync(tempFolder + sourcecodeFolderName)) { // nothing to fix as no files with conditions met
        console.log("nothing to fix as no files with conditions met");
        process.exit(0);
    }

    //create the tar after all files are created and copied
    // the tr for the batch run has to be crearted with the local tar. The node moldule is not working
    const tarball = execSync(`tar -czf ${tempFolder}app.tar.gz -C ${tempFolder + sourcecodeFolderName} .`);
    console.log('Tar is created');

    const projectID = await uploadBatch(credentials, (tempFolder+'app.tar.gz'), options)
    console.log('Project ID is: '+projectID)

    const checkBatchFixStatus = await checkFixBatch(credentials, projectID, options)

    if ( checkBatchFixStatus == 1 ){
        console.log('Batch Fixs are ready to be reviewed')
        const batchFixResults = await pullBatchFixResults(credentials, projectID, options)
        filterEmptyPatchesFromBatch(batchFixResults, options);
        if ( batchFixResults == 0 ){
            console.log('Something went wrong, no fixes generated')
        }
        else {
            console.log('Fixs pulled from batch fix')

            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('run_batch.ts - runBatch()')
                console.log('Batch Fix Results:')
                console.log(batchFixResults)
                console.log('#######- DEBUG MODE -#######')
            }

            //working with results
            if (options.prComment == 'true'){
                console.log('PR commenting is enabled')

                if (process.env.GITHUB_EVENT_NAME == 'pull_request'){
                    console.log('This is a PR - create PR comments')
                    createPRCommentBatch(batchFixResults, options, flawArray)
                    
                    console.log('This is a PR - create a check annotations')
                    //create a check run
                    let checkRunID = await createCheckRun(options)
                    options['checkRunID'] = checkRunID
                    console.log('Check Run ID is: '+checkRunID)
                    const checkRunUpate = await updateCheckRunUpdateBatch(options, batchFixResults, flawArray)
                    const checkRun = await updateCheckRunClose(options, options.checkRunID)
                }
                else {
                    console.log('... but wea are not running on a pull request')
                }
            }

            if ( options.codeSuggestion == 'true' ){
                console.log('Code suggestion is enabled')

                const batchFixResultsCount = Object.keys(batchFixResults.results).length;

                console.log('Number of files with fixes: '+batchFixResultsCount)
                let commentBody:any
                for (let i = 0; i < batchFixResultsCount; i++) {
                    let keys = Object.keys(batchFixResults.results);
                    console.log('Creating suggestions for '+keys[i])

                    //const codeSuggestion = addCodeSuggestion(batchFixResults, keys[i], options)
                }
            }

            if ( options.createPR == 'true' ){
                console.log('Creating PRs is enabled')
                const createPr = await createPR(batchFixResults, options, flawArray)
            }

        }
    }
    else {
        console.log('Batch Fix failed')

    }
    function filterEmptyPatchesFromBatch(batchFixResults: any, options: any): void {
        for (let key in batchFixResults.results) {
            let patch = batchFixResults.results[key].patch;
            if (patch.length == 0) {
                if (options.DEBUG == 'true') {
                    console.log('#######- DEBUG MODE -#######');
                    console.log('Removing files with empty patch from batchfix results');
                    console.log('#######- DEBUG MODE -#######');
                }
                delete batchFixResults.results[key];
            }
        }
    }

}