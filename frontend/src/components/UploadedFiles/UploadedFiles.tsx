import * as React from 'react';
import { UploadedFilesStyles } from './UploadedFilesStyles';
import { Button, Card, CardHeader, InfoLabel, Link, Subtitle2Stronger } from '@fluentui/react-components';
import { ArrowUpload16Regular, Dismiss16Regular } from '@fluentui/react-icons';

export interface IUploadedFilesProps {
    onFileUpload: (file: File) => void;
    onFileRemove: (file: File) => void;
    disabled?: boolean;
    files?: File[];
}

export const UploadedFiles: React.FunctionComponent<IUploadedFilesProps> = (props: React.PropsWithChildren<IUploadedFilesProps>) => {
    const styles = UploadedFilesStyles();
    const [files, setFiles] = React.useState<File[]>(props.files || []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles([...files, ...Array.from(event.target.files)]);
            props.onFileUpload(event.target.files[0]);
            // clear selection from file input
            event.target.value = '';
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
        <div className={styles.container}>
            <Card className={styles.card}>
                <CardHeader
                    className={styles.header}
                    header={
                        <Subtitle2Stronger>
                            Imported data
                            <InfoLabel
                                info={
                                    <>
                                        Sharing documents like Word files, text files, and PDFs can enhance your profile. Examples include meeting transcripts, social media profiles, and research papers, showcasing your expertise and achievements.
                                    </>
                                }
                            />
                        </Subtitle2Stronger>
                    }
                    action={
                        <Button
                            onClick={handleButtonClick}
                            icon={<ArrowUpload16Regular />}
                            disabled={props.disabled}
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
                <div className={styles.files}>
                    {files.map((file, index) => (
                        <div className={styles.fileRow} key={index}>

                            <Link>
                                <Button
                                    title="Remove file"
                                    size='small'
                                    icon={
                                        <Dismiss16Regular />
                                    }
                                    appearance='subtle'
                                    onClick={() => handleRemoveFile(index)}
                                />
                                {file.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </Card>
            <div className={styles.uploadSeparator}></div>
        </div>
    );
};