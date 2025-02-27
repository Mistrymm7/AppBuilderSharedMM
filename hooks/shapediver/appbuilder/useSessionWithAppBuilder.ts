import { validateAppBuilder } from "../../../types/shapediver/appbuildertypecheck";
import { IUseSessionDto, useSession } from "../useSession";
import { useOutputContent } from "../viewer/useOutputContent";
import { IAppBuilder } from "../../../types/shapediver/appbuilder";
import { useEffect, useMemo } from "react";
import { useAppBuilderCustomParameters } from "./useAppBuilderCustomParameters";

/** 
 * Name of data output used to define the AppBuilder UI 
 */
const CUSTOM_DATA_OUTPUT_NAME = "AppBuilder";

/**
 * Hook for creating a session with a ShapeDiver model using the ShapeDiver 3D Viewer.
 * 
 * Registers all parameters and exports defined by the model as abstracted 
 * parameters and exports for use by the UI components. 
 * 
 * TODO SS-7484 This hook also registers custom parameters and UI elements defined by a data output component 
 * of the model named "AppBuilder". Updates of the custom parameter values are fed back to the model as JSON into 
 * a text input named "AppBuilder".
 * 
 * @param props session to start
 * @param appBuilderOverride optional AppBuilder data to override the data from the model
 * @returns 
 */
export function useSessionWithAppBuilder(props: IUseSessionDto | undefined, appBuilderOverride?: IAppBuilder) {
	
	const namespace = props?.id ?? "";

	// start session and register parameters and exports
	const { sessionApi, error: sessionError } = useSession(props ? {
		...props,
	} : undefined);
	const sessionInitialized = !!sessionApi;

	// get data output, parse it
	const { outputApi, outputContent } = useOutputContent( namespace, CUSTOM_DATA_OUTPUT_NAME );

	const validate = (data: any) : IAppBuilder | undefined | Error => {
		const result = validateAppBuilder(data);
		if (result.success) {
			return result.data;
		}
		else {
			console.debug("Invalid AppBuilder data", data);
			
			return new Error(`Parsing AppBuilder data failed: ${result.error.message}`);
		}
	};

	const outputData = outputContent?.[0]?.data as IAppBuilder | string | undefined;
	const parsedData = useMemo(() => ((
		data : IAppBuilder | string | undefined, 
		appBuilderOverride: IAppBuilder | undefined,
		sessionInitialized: boolean
	) => { 
		if (appBuilderOverride && sessionInitialized) {
			if (data)
				console.debug("Overriding AppBuilder data from settings!");
			
			return validate(appBuilderOverride);
		}
		if (!data) return undefined;
		if (typeof data === "string") {
			let parsedJson : string;
			try {
				parsedJson = JSON.parse(data);
			} catch (e : any) {
				return new Error(`Parsing AppBuilder JSON data failed: ${e?.message ?? "unknown error"}`);
			}

			return validate(parsedJson);
		}
		
		return validate(data);
	})(outputData, appBuilderOverride, sessionInitialized), [outputData, appBuilderOverride, sessionInitialized]);

	useEffect(() => console.debug(CUSTOM_DATA_OUTPUT_NAME, parsedData), [parsedData]);

	const error = sessionError ?? (parsedData instanceof Error ? parsedData : undefined);
	const appBuilderData = parsedData instanceof Error ? undefined : parsedData;
	const hasAppBuilderOutput = !!outputApi;

	// register custom parameters
	useAppBuilderCustomParameters({sessionApi, appBuilderData, acceptRejectMode: props?.acceptRejectMode});
	
	return {
		sessionApi,
		namespace,
		error,
		appBuilderData,
		hasAppBuilderOutput
	};
}
