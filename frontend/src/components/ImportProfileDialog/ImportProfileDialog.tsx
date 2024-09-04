import { Button, Dialog, DialogActions, DialogContent, DialogSurface, Image, Spinner, Subtitle1 } from '@fluentui/react-components';
import * as React from 'react';
import { ImportProfileDialogStyles } from './ImportProfileDialogStyles';
import CoffeeImage from '../../assets/coffee.png';
import { getMCRProfile } from '../../api';
import { ProgressControls } from './ProgressControls';
import { AvatarCard } from '../AvatarCard/AvatarCard';
import { ArrowDownload16Regular, ArrowUpload16Regular, Dismiss16Regular, PersonCircleRegular } from '@fluentui/react-icons';
import { IUserProfile } from './IUserProfile';
import { set } from 'lodash';

export interface IImportProfileDialogProps {
    open: boolean;
    onProfileFinish: (message: string, profileFile: File | undefined) => void;
}

export const ImportProfileDialog: React.FunctionComponent<IImportProfileDialogProps> = (props: React.PropsWithChildren<IImportProfileDialogProps>) => {
    const styles = ImportProfileDialogStyles();
    const [open, setOpen] = React.useState(props.open);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [mSRprofile, setMSRProfile] = React.useState<IUserProfile | undefined>(undefined);
    const [searchingProfile, setSearchingProfile] = React.useState(false);

    const onImportClick = () => {
        document.getElementById('fileInputDialog')?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Get the first file from the list and set file
        if (event.target.files) {
            setFile(event.target.files[0]);
            // clear selection from file input
            event.target.value = '';
        }
    };

    const getProfile = async () => {
        // Get profile from the API
        setSearchingProfile(true);
        const prof = await getMCRProfile();
        setMSRProfile(prof);
        setSearchingProfile(false);
    };

    const submitProfile = () => {
        // Create message to send to AI.  If profile then add profile message to the message
        let message = 'Hello, I would like to submit some information about myself to help build my profile.';
        if (file) {
            message += ' with file';
        }
        if (mSRprofile) {
            // create text string to add to message from msrprofile
            message += mSRprofile.first_name + ' ' + mSRprofile.last_name + ' ' + mSRprofile.title;
            message += ' about: ' + mSRprofile.about;
        }
        // Submit the profile
        props.onProfileFinish(message, file);
        setOpen(false);
    };

    const thatsNotMeClick = () => {
        // Set index to 2
        setCurrentIndex(2);
        // Set the profile to null
        setMSRProfile(undefined);
    };

    React.useEffect(() => {
        if (currentIndex === 1) {
            getProfile();
        }
        if (currentIndex === 3) {
            submitProfile();
        }
    }, [currentIndex]);

    const getIndexContent = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <DialogContent>
                        <Image
                            src={CoffeeImage}
                            alt="Coffee"
                            className={styles.titleImage}
                            fit='cover'
                        />
                        <div className={styles.firstPageContent}>
                            <Subtitle1>Coffee Connections</Subtitle1>
                            <p>Thank you for testing our new Coffee Connections agent. </p>
                            <p>Using the power of AI to help you connect with like minded people within MSRx.</p>
                        </div>
                    </DialogContent>
                );
            case 1:
                return (
                    <DialogContent>
                        {
                            searchingProfile &&
                            <div className={styles.centeredContentloading}>
                                <Spinner size='large'>Searching for your profile...</Spinner>
                            </div>
                        }
                        {
                            mSRprofile && !searchingProfile ?
                                <>
                                    <Subtitle1>Import your data from microsoft.com/research?</Subtitle1>
                                    <p>We’d like to import your profile and project data from microsoft.com/research to help us improve your suggestions. Is this you?</p>
                                    <div className={styles.centeredContent}>
                                        <AvatarCard
                                            imageUrl={mSRprofile.profileImageUrl}
                                            title={mSRprofile.first_name + ' ' + mSRprofile.last_name}
                                            subtitle={mSRprofile.title}
                                        />
                                        <Button onClick={thatsNotMeClick}>That's not me</Button>
                                    </div>
                                </>
                                :
                                <div className={styles.centeredContentloading}>
                                    <div>We did not find a Microsoft.com/research profile</div>
                                </div>
                        }
                    </DialogContent>
                );
            case 2:
                return (
                    <DialogContent>
                        <Subtitle1>Import your data from LinkedIn?</Subtitle1>
                        <p>Please follow the steps below to download a PDF of your profile, and then use the import button below to share your data with us.</p>
                        <p>We’d like to import your profile from LinkedIn to help us improve your suggestions.</p>
                        <ol className={styles.list}>
                            <li>Click the <PersonCircleRegular fontSize={20} style={{ verticalAlign: 'top' }} /> Me icon at the top of your LinkedIn homepage.</li>
                            <li>Click the the <Button shape='circular' size='small'>More</Button> button in the introduction section.</li>
                            <li>Select <b><ArrowDownload16Regular style={{ verticalAlign: 'middle' }} /> Save to PDF </b>from the dropdown.</li>
                        </ol>
                        <p>Once you have your file click import below.</p>
                        {
                            !file &&
                            <div className={styles.importCommandRow}>
                                <Button onClick={onImportClick} icon={<ArrowUpload16Regular />}>Import</Button>
                            </div>
                        }
                        {
                            file &&
                            <div className={styles.fileUploadRow}>
                                <Button
                                    title="Remove file"
                                    icon={
                                        <Dismiss16Regular />
                                    }
                                    appearance='subtle'
                                    onClick={() => setFile(undefined)}
                                />
                                {file.name}
                            </div>
                        }
                    </DialogContent>
                );
            default:
                return (
                    <>

                    </>
                );
        }
    };

    return (
        <>
            <Dialog
                // this controls the dialog open state
                modalType="alert"
                open={open}
                onOpenChange={(event, data) => {
                    // it is the users responsibility to react accordingly to the open state change
                    setOpen(data.open);
                }}
            >
                <DialogSurface
                    className={styles.dialog}
                >
                    {
                        getIndexContent(currentIndex)
                    }
                    <DialogActions className={styles.dialogActions}>
                        <ProgressControls steps={3} currentIndex={currentIndex} onNextClick={() => setCurrentIndex(currentIndex + 1)} />
                    </DialogActions>
                </DialogSurface>
            </Dialog>
            <input type="file" id="fileInputDialog" className={styles.fileInput} onChange={handleFileChange} />
        </>
    );
};