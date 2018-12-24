export default {
    "component": "div",
    "id": "$div_SkoyX",
    "children": [
        {
            "component": "Row",
            "id": "$Row_BJU9V",
            "children": [
                {
                    "component": "Col",
                    "id": "$Col_S1U_H",
                    "children": [
                        {
                            "component": "p",
                            "id": "$p_rJyv1",
                            "children": [
                                {
                                    "component": "span",
                                    "id": "$span_ryuH2",
                                    "props": {
                                        "data_text": "根据你设置的规则，系统共为你找到"
                                    },
                                    "children": []
                                },
                                {
                                    "component": "span",
                                    "id": "$span_rJyvB",
                                    "props": {
                                        "data_text": "$store.$Iterator_list.$remote.page.totalNum",
                                        "style": {
                                            "color": " red",
                                            "fontSize": " 18px",
                                            "padding": " 0 5px",
                                            "fontWeight": " bold"
                                        }
                                    },
                                    "children": []
                                },
                                {
                                    "component": "span",
                                    "id": "$span_ryuHr",
                                    "props": {
                                        "data_text": "条记录"
                                    },
                                    "children": []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "component": "Row",
            "id": "$Row_rJkHC",
            "props": {
                "style": {
                    "marginBottom": " 20px"
                }
            },
            "children": [
                {
                    "component": "Col",
                    "id": "$span_HJgtU",
                    "props": {
                        "span": 3
                    },
                    "children": [
                        {
                            "component": "p",
                            "id": "$p_HyKPC",
                            "props": {
                                "data_html": "排序方式：",
                                "style": {
                                    "margin": "0"
                                },
                                "data_text": "排序方式"
                            },
                            "children": []
                        }
                    ]
                },
                {
                    "component": "Col",
                    "id": "$Col_S1j$3",
                    "props": {
                        "span": 3
                    },
                    "children": [
                        {
                            "component": "Select",
                            "id": "$Select_price",
                            "props": {
                                "value": "asc",
                                "shape": "normal",
                                "visible": false,
                                "placeholder": "",
                                "size": "small"
                            },
                            "fetch": {
                                "cycle": {
                                    "success": {},
                                    "error": {},
                                    "loading": {}
                                }
                            },
                            "events": {
                                "onChange": "__$Select_price_onChange"
                            },
                            "children": [
                                {
                                    "component": "SelectOption",
                                    "id": "$SelectOption_Sy_u1",
                                    "props": {
                                        "data_text": "当前价格升序",
                                        "value": "asc"
                                    },
                                    "children": []
                                },
                                {
                                    "component": "SelectOption",
                                    "id": "$SelectOption_Sy_u2",
                                    "props": {
                                        "data_text": "按拍卖时间降序",
                                        "value": "desc"
                                    },
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "component": "Col",
                    "id": "$Col_SylgG",
                    "props": {
                        "span": 3
                    },
                    "children": [
                        {
                            "component": "Select",
                            "id": "$Select_looknum",
                            "props": {
                                "value": "asc",
                                "shape": "normal",
                                "visible": false,
                                "placeholder": "",
                                "size": "small"
                            },
                            "fetch": {
                                "cycle": {
                                    "success": {},
                                    "error": {},
                                    "loading": {}
                                }
                            },
                            "events": {
                                "onChange": "__$Select_looknum_onChange"
                            },
                            "children": [
                                {
                                    "component": "SelectOption",
                                    "id": "$SelectOption_Bybe1",
                                    "props": {
                                        "data_text": "围观次数升序",
                                        "value": "asc"
                                    },
                                    "children": []
                                },
                                {
                                    "component": "SelectOption",
                                    "id": "$SelectOption_Bybe2",
                                    "props": {
                                        "data_text": "围观次数降序",
                                        "value": "desc"
                                    },
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "component": "Col",
                    "id": "$Col_SyWXm",
                    "props": {
                        "span": 9
                    },
                    "children": [
                        {
                            "component": "Search",
                            "id": "$Search_keyword",
                            "props": {
                                "size": "medium",
                                "type": "secondary",
                                "searchText": "关键词",
                                "inputWidth": 0,
                                "placeholder": "",
                                "autoWidth": false,
                                "value": "",
                                "style": {
                                    "float": "right"
                                }
                            },
                            "fetch": {
                                "cycle": {
                                    "success": {},
                                    "error": {},
                                    "loading": {}
                                }
                            },
                            "events": {
                                "onSearch": "__$Search_keyword_onSearch"
                            },
                            "children": []
                        }
                    ]
                }
            ]
        },
        {
            "component": "Iterator",
            "id": "$Iterator_list",
            "props": {
                "dataSource": "$store.$Iterator_list.$remote.list"
            },
            "children": [
                {
                    "component": "ListItemForSelect",
                    "id": "$ListItemForSelect_HyJ06",
                    "props": {
                        "link": "111333",
                        "title": "111222",
                        "image": "111",
                        "type": "oa",
                        "tags": "111",
                        "startPrice": 22,
                        "increasePrice": 222,
                        "startTime": 44,
                        "endTime": 44,
                        "seller": "55",
                        "sellerLink": "55",
                        "style": {
                            "marginRight": " 10px",
                            "float": "left"
                        }
                    },
                    "fetch": {
                        "cycle": {
                            "success": {},
                            "error": {},
                            "loading": {}
                        }
                    },
                    "children": []
                }
            ]
        },
        {
            "component": "Pagination",
            "id": "$Pagination_BySOE",
            "props": {
                "current": "$store.$Iterator_list.$remote.page.pageNo",
                "total": "$store.$Iterator_list.$remote.page.totalPage",
                "pageSize": "$store.$Iterator_list.$remote.page.pageSize",
                "type": "normal",
                "style": {
                    "marginTop": "20px"
                }
            },
            "children": []
        }
    ]
}