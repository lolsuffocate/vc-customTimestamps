/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings, useSettings } from "@api/Settings";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Forms, Heading, moment, TextInput, useEffect, useState } from "@webpack/common";

type TimeFormat = {
    name: string;
    description: string;
    default: string;
    offset: number;
};
type TimeRowProps = {
    id: string;
    format: TimeFormat;
    onChange: (key: string, value: string) => void;
    pluginSettings: any;
};

const timeFormats: Record<string, TimeFormat> = {
    cozyFormat: {
        name: "Cozy mode",
        description: "Time format to use in messages on cozy mode",
        default: "[calendar]",
        offset: 0,
    },
    compactFormat: {
        name: "Compact mode",
        description: "Time format on compact mode and hovering messages",
        default: "LT",
        offset: 0,
    },
    tooltipFormat: {
        name: "Tooltip",
        description: "Time format to use on tooltips",
        default: "LLLL • [relative]",
        offset: 0,
    },
    sameDayFormat: {
        name: "Same day",
        description: "[calendar] format for today",
        default: "HH:mm:ss",
        offset: 0,
    },
    lastDayFormat: {
        name: "Last day",
        description: "[calendar] format for yesterday",
        default: "[yesterday] HH:mm:ss",
        offset: -1000 * 60 * 60 * 24,
    },
    lastWeekFormat: {
        name: "Last week",
        description: "[calendar] format for last week",
        default: "ddd DD.MM.YYYY HH:mm:ss",
        offset: -1000 * 60 * 60 * 24 * 7,
    },
    sameElseFormat: {
        name: "Same else",
        description: "[calendar] format for older dates",
        default: "ddd DD.MM.YYYY HH:mm:ss",
        offset: -1000 * 60 * 60 * 24 * 30,
    }
};

const format = (date: Date, formatTemplate: string): string => {
    const mmt = moment(date);

    const sameDayFormat = settings.store?.formats?.sameDayFormat || timeFormats.sameDayFormat.default;
    const lastDayFormat = settings.store?.formats?.lastDayFormat || timeFormats.lastDayFormat.default;
    const lastWeekFormat = settings.store?.formats?.lastWeekFormat || timeFormats.lastWeekFormat.default;
    const sameElseFormat = settings.store?.formats?.sameElseFormat || timeFormats.sameElseFormat.default;

    return mmt.format(formatTemplate)
        .replace("relative", () => mmt.fromNow())
        .replace("calendar", () => mmt.calendar(null, {
            sameDay: sameDayFormat,
            lastDay: lastDayFormat,
            lastWeek: lastWeekFormat,
            sameElse: sameElseFormat
        }));
};

const TimeRow = (props: TimeRowProps) => {
    const [state, setState] = useState(props.pluginSettings?.[props.id] || props.format.default);
    const [preview, setPreview] = useState("");

    const handleChange = (value: string) => {
        setState(value);
        props.onChange(props.id, value);
    };

    useEffect(() => {
        setPreview(format(new Date(Date.now() + props.format.offset), state || props.format.default));
    }, [state]);

    return (
        <div style={{ padding: "0 0 20px 0" }}>
            <Heading>{props.format.name}</Heading>
            <Forms.FormText>{props.format.description}</Forms.FormText>
            <TextInput value={state} onChange={handleChange}/>
            <Forms.FormText style={{ color: "red" }}>{preview}</Forms.FormText>
        </div>
    );
};

const settings = definePluginSettings({
    formats: {
        type: OptionType.COMPONENT,
        description: "Customize the timestamp formats",
        component: componentProps => {
            const [settingsState, setSettingsState] = useState(useSettings().plugins?.CustomTimestamps?.formats ?? {});

            const setNewValue = (key: string, value: string) => {
                const newSettings = { ...settingsState, [key]: value };
                setSettingsState(newSettings);
                componentProps.setValue(newSettings);
            };

            return (
                <Forms.FormSection>
                    {Object.entries(timeFormats).map(([key, value]) => {
                        if (key === "sameDayFormat") {
                            // todo: do properly
                            return <>
                                <div style={{ padding: "0 0 20px 0" }}>
                                    <Forms.FormTitle tag="h3">Calendar formats</Forms.FormTitle>
                                    <Forms.FormText>
                                        How to format the [calendar] value if used in the above timestamps.
                                    </Forms.FormText>
                                </div>
                                <TimeRow
                                    id={key}
                                    format={value}
                                    onChange={setNewValue}
                                    pluginSettings={settingsState}
                                />
                            </>;
                        }
                        return <TimeRow
                            id={key}
                            format={value}
                            onChange={setNewValue}
                            pluginSettings={settingsState}
                        />;
                    })}
                </Forms.FormSection>
            );
        }
    }
}).withPrivateSettings<{
    formats: {
        cozyFormat: string;
        compactFormat: string;
        tooltipFormat: string;
        sameDayFormat: string;
        lastDayFormat: string;
        lastWeekFormat: string;
        sameElseFormat: string;
    };
}>();

export default definePlugin({
    name: "CustomTimestamps",
    description: "Custom timestamps on messages and tooltips",
    authors: [
        Devs.Rini,
        { id: 165098921071345666n, name: "nvhhr" },
        { name: "Suffocate", id: 772601756776923187n }
    ],
    settings,
    settingsAboutComponent: () => (
        <>
            <Forms.FormTitle tag="h3">How to use:</Forms.FormTitle>
            <Forms.FormText>
                <Link href="https://momentjs.com/docs/#/displaying/format/">Moment.js formatting documentation</Link>
                <p>
                    Additionally you can use these in your inputs:<br/>
                    <b>[calendar]</b> enables dynamic date formatting (see options below),<br/>
                    <b>[relative]</b> gives you times such as &quot;4 hours ago&quot;.<br/>
                </p>
            </Forms.FormText>
        </>
    ),
    patches: [{
        find: "#{intl::MESSAGE_EDITED_TIMESTAMP_A11Y_LABEL}",
        replacement: [
            {
                match: /(?<=\i=\i\?)\(0,\i\.\i\)\((\i),"LT"\):\(0,\i\.\i\)\(\i\)/,
                replace: "$self.formatCompact($1):$self.formatCozy($1)",
            },
            {
                match: /(?<=text:)\(0,\i.\i\)\((\i),"LLLL"\)(?=,)/,
                replace: "$self.formatTooltip($1)",
            },
        ]
    }],

    formatCompact(date: Date) {
        return format(date, settings.use(["formats"]).formats?.compactFormat || timeFormats.compactFormat.default);
    },

    formatCozy(date: Date) {
        return format(date, settings.use(["formats"]).formats?.cozyFormat || timeFormats.cozyFormat.default);
    },

    formatTooltip(date: Date) {
        return format(date, settings.use(["formats"]).formats?.tooltipFormat || timeFormats.tooltipFormat.default);
    }
});
