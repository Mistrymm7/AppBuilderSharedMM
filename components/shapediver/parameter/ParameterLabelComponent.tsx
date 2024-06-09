import { Group, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useParameter } from "../../../hooks/shapediver/parameters/useParameter";
import React from "react";
import { PropsParameter } from "../../../types/components/shapediver/propsParameter";

interface Props extends PropsParameter {
	cancel?: () => void
}

/**
 * Functional component that creates a label for a parameter or .
 *
 * @returns
 */
export default function ParameterLabelComponent(props: Props) {
	const { cancel } = props;
	const { definition } = useParameter<any>(props);

	return <Group justify="space-between" w="100%" wrap="nowrap">
		<Text pb={4} size="sm" fw={500}>
			{definition.displayname || definition.name}
		</Text>
		{cancel && <IconX size="16" color="red" onClick={cancel} />}
	</Group>;
}
