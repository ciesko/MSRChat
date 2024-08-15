import * as React from 'react';
import { UploadedFilesStyles } from './UploadedFilesStyles';
import { Button, Card, CardHeader, Subtitle2Stronger } from '@fluentui/react-components';
import { ArrowUpload16Regular } from '@fluentui/react-icons';

export interface IUploadedFilesProps {
    onFileUpload: (file: File) => void;
 }

export const UploadedFiles: React.FunctionComponent<IUploadedFilesProps> = (props: React.PropsWithChildren<IUploadedFilesProps>) => {
    const styles = UploadedFilesStyles();
    const [files, setFiles] = React.useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles([...files, ...Array.from(event.target.files)]);
            props.onFileUpload(event.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        document.getElementById('fileInput')?.click();
    };

    return (
        <Card className={styles.container}>
            <CardHeader
            className={styles.header}
                header={
                    <Subtitle2Stronger>Documents and links</Subtitle2Stronger>
                }
                action={
                        <Button
                            onClick={handleButtonClick}
                            icon={<ArrowUpload16Regular />}
                        >
                            Upload
                        </Button>
                }

            />



            <input
                id="fileInput"
                type="file"
                aria-label='File input'
                onChange={handleFileChange}
                className={styles.fileUploadControl}
            />
            <ul>
                {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                ))}
            </ul>
        </Card>
    );
};