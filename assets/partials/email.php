<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">Gmail API app</a>
    </div>
  </div>
</nav>
<!-- <input type="text" placeholder="Search email">
<div class="dropdown pull-right">
  <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
    Limit
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
    <li><a href="#">5</a></li>
    <li><a href="#">10</a></li>
    <li><a href="#">20</a></li>
  </ul>
</div> -->
<div>
  <ul class="nav nav-pills">
    <li role="presentation" ng-repeat="label in topLabels" ng-click="setSelectedLabel(label)" class="col-md-2 top-label" ng-class="{'active': isLabelSelected(label)}"><a href="#{{ label.value }}" data-toggle="tab">{{ label.value }}</a></li>
  </ul>
</div>
<div class="clearfix email-container">
  <div class="col-md-1 label-container">
<!--     <ul>
      <li ng-repeat="label in labels">{{ label.name }}</li>
    </ul> -->
  </div>
    <div class="col-md-3 message-item-container">
     <!-- ng-show="thread.messages[0].labelIds.indexOf(getSelectedLabel()) != -1" -->
    <div ng-repeat="thread in threads" ng-click="setSelectedThread(thread)" class="message-item" ng-animate="'animate'" ng-class="{'selected-message-item': isThreadSelected(thread)}">
      <div class="row">
        <div class="col-md-8">
            <p>{{ thread.messages[0].payload.headers['From'] }}</p>
        </div>
        <div class="col-md-4">
          <p class="pull-right">{{ thread.messages[0].payload.headers['Date'] | date:'MM/dd/yyyy' }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <p>{{ thread.messages[0].payload.headers['Subject'] }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-8 message-container">
    <div ng-repeat="message in selectedThread.messages">
      <p><strong>Labels:</strong> {{message.labelIds}}</p>
      <p><strong>Subject:</strong> {{ message.payload.headers['Subject'] }}</p>
      <p><strong>From:</strong> {{ message.payload.headers['From'] }}</p>
      <p><strong>To:</strong> {{ message.payload.headers['To'] }}</p>
      <p><strong>Date:</strong> {{ message.payload.headers['Date'] }}</p>
      <!-- {{message.payload.parts}} -->
      <div ng-repeat="part in message.payload.parts">
        <div ng-if="part.mimeType === 'text/html'">
          <div ng-bind-html="renderHtml(part.body.data)"></div>
        </div>
        <hr>
      </div>
<!--       <div ng-bind-html="renderHtml(message.payload.parts[1].body[0].data)"></div>
      <div ng-bind-html="renderHtml(message.payload.parts[0].parts[1].body[0].data)"></div> -->
      <hr>
    </div>
<!--       <p><strong>Subject:</strong> {{ selectedThread.messages[0].payload.headers['Subject'] }}</p>
      <p><strong>From:</strong> {{ selectedThread.messages[0].payload.headers['From'] }}</p>
      <p><strong>To:</strong> {{ selectedThread.messages[0].payload.headers['To'] }}</p>
    
      <div ng-bind-html="renderHtml(selectedThread.messages[0].payload.parts[1].body[0].data)"></div>
      <div ng-bind-html="renderHtml(selectedThread.messages[0].payload.parts[0].parts[1].body[0].data)"></div>  -->
  </div>
</div>