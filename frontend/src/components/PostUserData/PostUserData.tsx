import * as React from 'react';
import { post_user_data } from '../../api';
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    Field,
    Input,
    Textarea,
    tokens,
    Subtitle2,
    Link
} from "@fluentui/react-components";
import { PostUserDataStyles } from './PostUserDataStyles';
import { CheckmarkCircleFilled, ErrorCircleFilled } from '@fluentui/react-icons';
import { OpenTagPicker } from '../FormControls/OpenTagPicker/OpenTagPicker';

export type Project = {
    project_name: string;
    project_overview: string;
    team_members: {
        name: string;
        role: string;
    }[];
    resources: string[];
    status: string;
};

export interface IPostUserDataProps {
    buttonTitle: string;
    messageId: string;
    project: Project;
    onSaveSuccess: () => void;
}

export const PostUserData: React.FunctionComponent<IPostUserDataProps> = (props: React.PropsWithChildren<IPostUserDataProps>) => {
    const styles = PostUserDataStyles();
    const [saving, setSaving] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');
    const [success, setSuccess] = React.useState<boolean>(false);
    const [project, setProject] = React.useState<Project>(props.project);

    React.useEffect(() => {
        setProject(props.project);
    }, [props.project]);

    const submitProject = async () => {
        setSaving(true);
        try {
            const response = await post_user_data(props.messageId, project);
            // if response.status is not 200, throw an error
            if (response.status !== 200) {
                throw new Error("There was an error saving your project.");
            }
            setSuccess(true);
            props.onSaveSuccess();
        } catch (e) {
            setError("There was an error saving your project.");
        }
        setSaving(false);
    }

    const invalidForm = () => {
        return project.project_name === '' || project.project_overview === '' || project.team_members.length === 0;
    }

    const saveNewMember = (member: string) => {
        setProject({ ...project, team_members: [...project.team_members, { name: member, role: '' }] });
    }

    return (
        <Dialog modalType='non-modal'>
            <DialogTrigger disableButtonEnhancement>
                <Button>{props.buttonTitle}</Button>
            </DialogTrigger>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Submit your project</DialogTitle>
                    <DialogContent>
                        {
                            success &&
                            <div className={styles.successContainer}>
                                <CheckmarkCircleFilled fontSize={100} color={tokens.colorPaletteGreenForeground1} />
                                <Subtitle2 className={styles.successText}>Congratulations, your project was submitted succesfully!</Subtitle2>
                            </div>
                        }
                        {
                            error !== '' &&
                            <div className={styles.successContainer}>
                                <ErrorCircleFilled fontSize={100} color={tokens.colorPaletteRedForeground1} />
                                <Subtitle2 className={styles.successText}>{error}  <Link as='button' onClick={() => setError('')}>Click here</Link> to try again.</Subtitle2>
                            </div>
                        }
                        {
                            !success && !error &&
                            <div className={styles.formContainer}>

                                <Field
                                    label="Project Name"
                                    required
                                >
                                    <Input
                                        onChange={(e) => setProject({ ...project, project_name: (e.target as HTMLInputElement).value })}
                                        defaultValue={project.project_name}
                                        disabled={saving || success}
                                    />
                                </Field>
                                <Field
                                    label="Project Overview"
                                    required
                                >
                                    <Textarea
                                        onChange={(e, d) => setProject({ ...project, project_overview: d.value })}
                                        defaultValue={project.project_overview}
                                        rows={5}
                                        disabled={saving || success}
                                    />
                                </Field>
                                <div>
                                    <OpenTagPicker
                                        label='Team members'
                                        defaultSelectedOptions={project.team_members.map(member => member.name)}
                                        onChange={
                                            (selectedOptions) => {
                                                setProject({ ...project, team_members: selectedOptions.map(name => ({ name: name, role: '' })) });
                                            }
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <OpenTagPicker
                                        label='Resources'
                                        defaultSelectedOptions={project.resources}
                                        useBookIcon
                                        onChange={
                                            (selectedOptions) => {
                                                setProject({ ...project, resources: selectedOptions });
                                            }
                                        }
                                    />
                                </div>
                            </div>
                        }
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                        <Button
                            appearance="primary"
                            onClick={submitProject}
                            disabled={saving || invalidForm() || success || error !== ''}
                        >
                            Submit project
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};