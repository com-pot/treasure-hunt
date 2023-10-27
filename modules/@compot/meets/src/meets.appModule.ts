import { AppModule } from "../../../../src/app/types/app";

export const entities: AppModule['entities'] = {
    Meet: {
        primaryKey: "slug",
        stringify: {
            template: "[{{ slug }}] {{ i18n:pick/title }}"
        },
    },
    QuickMessage: {
        defaultSort: { order: 1 },
        stringify: {
            template: "[{{meet}}:{{order}}] {{id}}",
        },
    },
}
