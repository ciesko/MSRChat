import * as React from 'react';
import { UserProfileFormStyles } from './UserProfileFormStyles';
import { Button, Card, CardFooter, Field, Input, Subtitle2, Subtitle2Stronger, Textarea } from '@fluentui/react-components';

export interface IUserProfileFormProps { }

export const UserProfileForm: React.FunctionComponent<IUserProfileFormProps> = (props: React.PropsWithChildren<IUserProfileFormProps>) => {
  const styles = UserProfileFormStyles();
  return (
    <Card className={styles.container}>
      <Subtitle2Stronger>Your form - this will dynamically update based on the chat to the left.  You can also make edits directly.</Subtitle2Stronger>
      <Subtitle2>When you are happy with the content click save.</Subtitle2>
      <Field
        label="Name"
        required
        {...props}
      >
        <Input />
      </Field>
      <Field
        label="Professional background"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <Field
        label="Work Style Preferences"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <Field
        label="Personal Interests"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <Field
        label="Social and lifestyle"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <Field
        label="Preferences and values"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <Field
        label="Fun facts"
        required
        {...props}
        className={styles.textAreaField}
      >
        <Textarea />
      </Field>
      <div className={styles.footerRow}>
        <CardFooter>
          <Button appearance='primary'>Save</Button>
        </CardFooter>
      </div>
    </Card>
  );
};