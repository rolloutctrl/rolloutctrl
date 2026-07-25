import {
  MultiSelect as MantineMultiSelect,
  type MultiSelectStylesNames,
} from '@mantine/core';
import { type FC, type ReactNode } from 'react';

export type OptionSelect = {
  value: string;
  label: string;
};

export type MultiSelectInputSize = 'small' | 'medium' | 'large';

type MultiSelectProps = {
  name: string;
  options: OptionSelect[];
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  maxSelections?: number;
  isSearchable?: boolean;
  placeholder?: string;
  value: string[];
  setSelectedValues: (values: string[]) => void;
  onClear?: () => void;
  onRemove?: (value: string) => void;
  nothingFound?: ReactNode;
  description?: string;
  error?: ReactNode;
  isRequired?: boolean;
  clearable?: boolean;
  classNames?: Partial<Record<MultiSelectStylesNames, string>>;
  pillsListClassName?: string;
  dropdownOpened?: boolean;
};

export const MultiSelect: FC<MultiSelectProps> = (props) => {
  const {
    name,
    options,
    label,
    icon,
    maxSelections,
    disabled,
    isSearchable,
    placeholder,
    description,
    value,
    nothingFound = 'Not found',
    error,
    isRequired,
    clearable,
    classNames,
    dropdownOpened,
    setSelectedValues,
    onClear,
    onRemove,
  } = props;

  return (
    <MantineMultiSelect
      label={label}
      name={name}
      data={options}
      placeholder={placeholder}
      value={value}
      onChange={setSelectedValues}
      onClear={onClear}
      onRemove={onRemove}
      description={description}
      leftSection={icon}
      searchable={isSearchable}
      maxValues={maxSelections}
      disabled={disabled}
      dropdownOpened={dropdownOpened}
      checkIconPosition="right"
      classNames={classNames}
      nothingFoundMessage={nothingFound}
      error={error}
      withAsterisk={isRequired}
      clearable={clearable}
    />
  );
};
