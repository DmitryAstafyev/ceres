export enum ERequestTypes {    
    get     = 'GET',
    post    = 'POST',
    put     = 'PUT',
    delete  = 'DELETE',
    option  = 'OPTION'
};

export type TRequestType = ERequestTypes.post | ERequestTypes.get | ERequestTypes.put | ERequestTypes.option | ERequestTypes.delete;