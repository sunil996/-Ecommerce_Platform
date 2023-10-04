import S3 from 'aws-sdk/clients/s3';

export class filefunctions {
    /**
     * Upload file to AWS S3 bucket
     * @param file req.files[filename] object
     */
    async uploadFileToS3(file: any, folder: string, filename: string) {
        if (!file || !Buffer.isBuffer(file)) return false;

        try {
            let s3 = new S3({
                accessKeyId: "",
                secretAccessKey: "",
            });

            var s3UploadPromise = await new Promise(function (resolve, reject) {
                s3.createBucket(function () {
                    var params = {
                        Bucket: "Bucket Name",
                        Key: filename,
                        Body: file,
                        ACL: "private"
                    };
                    s3.upload(params, function (err: any, data: any) {
                        if (err) {
                            reject(err);

                            // insert error log if any

                            return false;
                        } else {
                            resolve(data);
                        }
                    });
                });
            });

            return s3UploadPromise;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
