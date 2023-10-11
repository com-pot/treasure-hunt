import { AppModule } from "../../../../src/app/types/app";

export const entities: AppModule['entities'] = {
    Activity: {
        plural: "Activities",
        primaryKey: "slug",
        stringify: {
            template: "[{{ meet }}:{{ slug }}] {{ i18n:pick/title }}"
        },
    },
}
