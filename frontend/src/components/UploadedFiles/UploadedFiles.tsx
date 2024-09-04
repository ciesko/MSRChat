import * as React from 'react';
import { UploadedFilesStyles } from './UploadedFilesStyles';
import { Button, Card, CardHeader, Link, Subtitle2Stronger } from '@fluentui/react-components';
import { ArrowUpload16Regular, Dismiss16Regular } from '@fluentui/react-icons';

export interface IUploadedFilesProps {
    onFileUpload: (file: File) => void;
    onFileRemove: (file: File) => void;
    files?: File[];
}

export const UploadedFiles: React.FunctionComponent<IUploadedFilesProps> = (props: React.PropsWithChildren<IUploadedFilesProps>) => {
    const styles = UploadedFilesStyles();
    const [files, setFiles] = React.useState<File[]>(props.files || []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles([...files, ...Array.from(event.target.files)]);
            props.onFileUpload(event.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        document.getElementById('fileInput')?.click();
    };

    const handleRemoveFile = (index: number) => {
        props.onFileRemove(files[index]);
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    React.useEffect(() => {
        setFiles(props.files || []);
    }, [props.files]);

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
                        Import
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
            <div>
                {files.map((file, index) => (
                    <div className={styles.fileRow} key={index}>
                        <Button
                            title="Remove file"
                            size='small'
                            icon={
                                <Dismiss16Regular />
                            }
                            appearance='subtle'
                            onClick={() => handleRemoveFile(index)} 
                        />
                        <Link>
                            {file.name}
                        </Link>
                    </div>
                ))}
            </div>
        </Card>
    );
};