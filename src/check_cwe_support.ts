//move  CWESupportmatrix  to constants file and import here

import { CWESupportMatrix } from './constants'

export async function checkCWE(flawInfo:any, options:any,batchFix=false){ 
    if (flawInfo.language == 'java'){
        console.log('CWE check for Java')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.java : CWESupportMatrix.individual.java
        if (supportedCWEs.includes(flawInfo.cweID)){

            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('CWE '+flawInfo.cweID+' is supported for Java')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported Java')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'csharp'){
        console.log('CWE check for C#')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.cs : CWESupportMatrix.individual.cs
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for csharp')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported sharp')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'javascript'){
        if (options.DEBUG == 'true'){
            console.log('#######- DEBUG MODE -#######')
            console.log('check_cwe_support.ts')
            console.log('CWE check for JavaScript')
            console.log('#######- DEBUG MODE -#######')
        }
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.js : CWESupportMatrix.individual.js
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for JavaScript')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported JavaScript')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'python'){
        console.log('CWE check for Python')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.py : CWESupportMatrix.individual.py
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for Python')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported Python')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'php'){
        console.log('CWE check for PHP')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.php : CWESupportMatrix.individual.php
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for PHP')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported PHP')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'scala'){
        console.log('CWE check for Scala')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.scala : CWESupportMatrix.individual.scala
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for Scala')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported Scala')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'kotlin'){
        console.log('CWE check for Kotlin')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.kotlin : CWESupportMatrix.individual.kotlin
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for Kotlin')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported Kotlin')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
    else if (flawInfo.language == 'go'){
        console.log('CWE check for Go')
        const supportedCWEs = batchFix ? CWESupportMatrix.batch.go : CWESupportMatrix.individual.go
        if (supportedCWEs.includes(flawInfo.cweID)){
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is supported for Go')
                console.log('#######- DEBUG MODE -#######')
            }
            return true
        }
        else {
            if (options.DEBUG == 'true'){
                console.log('#######- DEBUG MODE -#######')
                console.log('check_cwe_support.ts')
                console.log('Checks - CWE '+flawInfo.cweID+' is not supported Go')
                console.log('#######- DEBUG MODE -#######')
            }
            return false
        }
    }
}