import { AppModule } from "../../../../src/app/types/app";

export const entities: AppModule['entities'] = {
    Meet: {
        primaryKey: "slug",
        stringify: {
            template: "[{{ slug }}] {{ i18n:pick/title }}"
        },
    },
}
