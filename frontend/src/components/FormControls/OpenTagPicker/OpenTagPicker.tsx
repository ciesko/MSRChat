import * as React from "react";
import {
    TagPicker,
    TagPickerList,
    TagPickerInput,
    TagPickerControl,
    TagPickerProps,
    TagPickerOption,
    TagPickerGroup,
    useTagPickerFilter,
} from "@fluentui/react-components";
import { Tag, Avatar, Field } from "@fluentui/react-components";
import { BookAdd28Filled, BookDefaultFilled } from "@fluentui/react-icons";

export interface IOpenTagPicker {
    label: string;
    defaultSelectedOptions: string[];
    useBookIcon?: boolean;
    required?: boolean;
    onChange: (selectedOptions: string[]) => void;
}

export const OpenTagPicker: React.FunctionComponent<IOpenTagPicker> = (props: React.PropsWithChildren<IOpenTagPicker>) => {
    const [query, setQuery] = React.useState<string>("");
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>(props.defaultSelectedOptions);
    const [options, setOptions] = React.useState<string[]>([]);

    // When query changes update the options to be the query
    React.useEffect(() => {
        setOptions([query]);
    }, [query]);

    const onOptionSelect: TagPickerProps["onOptionSelect"] = (e, data) => {
        if (data.value === "no-matches") {
            return;
        }
        // If selected option is blank, do nothing
        if (data.selectedOptions.includes("")) {
            return;
        }
        setSelectedOptions(data.selectedOptions);
        props.onChange(data.selectedOptions);
        setQuery("");
    };

    const children = useTagPickerFilter({
        query,
        options,
        noOptionsElement: (
            <TagPickerOption value="no-matches">
                We couldn't find any matches
            </TagPickerOption>
        ),
        renderOption: (option) => (
            <TagPickerOption
                key={option}
                media={props.useBookIcon ? <BookAdd28Filled color="colorful" /> : <Avatar aria-hidden name={option} color="colorful" />}
                value={option}
            >
                {option}
            </TagPickerOption>
        ),

        filter: (option) =>
            true
    });
    return (
        <Field label={props.label} style={{ maxWidth: '100%', overflow: 'hidden' }} required={props.required}>
            <TagPicker
                onOptionSelect={onOptionSelect}
                selectedOptions={selectedOptions}
            >
                <TagPickerControl>
                    <TagPickerGroup>
                        {selectedOptions.map((option) => (
                            <Tag
                                key={option}
                                shape="rounded"
                                media={props.useBookIcon ? <BookDefaultFilled /> : <Avatar aria-hidden name={option} color="colorful" />}
                                value={option}
                                title={option}
                            >
                                {option}
                            </Tag>
                        ))}
                    </TagPickerGroup>
                    <TagPickerInput
                        aria-label={`Select ${props.label}`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </TagPickerControl>
                <TagPickerList>{children}</TagPickerList>
            </TagPicker>
        </Field>
    );
};