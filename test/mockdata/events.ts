export default `window['__$Select_time_onChange'] = function handle(ev){
    $store.$Iterator_list.fetch({page:1});          
}
window['__$Select_price_onChange'] = function handle(ev){
    $store.$Iterator_list.fetch({page:1});          
}
window['__$Select_bidcount_onChange'] = function handle(ev){
     $store.$Iterator_list.fetch({page:1});         
}
window['__$Select_looknum_onChange'] = function handle(ev){
  $store.$Iterator_list.fetch({page:1});            
}
window['__$Search_keyword_onSearch'] = function handle(ev){
          $store.$Iterator_list.fetch({page:1});    
}
`;
