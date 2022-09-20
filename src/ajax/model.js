// TODO: clone on getting request/response

export class AjaxRequestEvent {

  constructor(source, { request, ...props }) {
    this.source = source;
    this.type = 'request';
    this.request = request;
    this.url = new URL(request.url);
    Object.assign(this, props);
    Object.freeze(this);
  }

}

export class AjaxResponseEvent {

  constructor(source, { request, response, ...props }) {
    this.source = source;
    this.type = 'response';
    this.request = request;
    this.response = response;
    this.url = new URL(request.url);
    Object.assign(this, props);
    Object.freeze(this);
  }

}
